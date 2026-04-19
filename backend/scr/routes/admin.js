const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { query, pool } = require('../BD/pool');

const router = express.Router();

// ============================================================================
// 1. MÓDULO DE MODERACIÓN DE CONTENIDO
// ============================================================================

// GET /api/v1/admin/posts -> Lista publicaciones según su estado
router.get('/posts', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const estado = req.query.estado || 'PENDIENTE';
    const page   = parseInt(req.query.page || '1');
    const limit  = 10;
    const offset = (page - 1) * limit;

    try {
        const result = await query(`
            SELECT p.*, u.nombre_usuario 
            FROM publicacion p 
            JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.estado = $1 
            ORDER BY p.fecha_creacion DESC
            LIMIT $2 OFFSET $3`, 
            [estado, limit, offset]
        );
        res.json({ posts: result.rows });
    } catch (err) {
        console.error('Error Administrativo (GET Posts):', err);
        res.status(500).json({ error: 'Error al recuperar publicaciones para moderación.' });
    }
});

// ── 1.A LÓGICA UNIVERSAL PARA APROBAR POSTS ──
const aprobarPost = async (req, res) => {
    const postId = parseInt(req.params.id);
    const adminId = req.user.sub;
    const ip = req.ip;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pRes = await client.query('SELECT id, estado FROM publicacion WHERE id = $1', [postId]);
        
        if (!pRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const updateRes = await client.query(
            "UPDATE publicacion SET estado = 'PUBLICADO' WHERE id = $1 RETURNING *",
            [postId]
        );

        // Auditoría requerida por UPANA
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
             VALUES ($1, 'APROBAR_POST', 'publicacion', $2, $3)`,
            [adminId, JSON.stringify({ post_id: postId, nuevo_estado: 'PUBLICADO' }), ip]
        );

        await client.query('COMMIT');
        res.json({ message: 'Publicación APROBADA con éxito.', post: updateRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al aprobar:', err);
        res.status(500).json({ error: 'Fallo al aprobar la publicación.' });
    } finally {
        client.release();
    }
};

// Asignamos la misma función sin importar si el Frontend usa PUT, PATCH o POST
router.put('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost);
router.patch('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost);
router.post('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost);


// ── 1.B LÓGICA UNIVERSAL PARA RECHAZAR POSTS ──
const rechazarPost = async (req, res) => {
    const postId = parseInt(req.params.id);
    const adminId = req.user.sub;
    const ip = req.ip;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pRes = await client.query('SELECT id, estado FROM publicacion WHERE id = $1', [postId]);
        
        if (!pRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const updateRes = await client.query(
            "UPDATE publicacion SET estado = 'BLOQUEADO' WHERE id = $1 RETURNING *",
            [postId]
        );

        // Auditoría requerida por UPANA
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
             VALUES ($1, 'RECHAZAR_POST', 'publicacion', $2, $3)`,
            [adminId, JSON.stringify({ post_id: postId, nuevo_estado: 'BLOQUEADO' }), ip]
        );

        await client.query('COMMIT');
        res.json({ message: 'Publicación RECHAZADA.', post: updateRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al rechazar:', err);
        res.status(500).json({ error: 'Fallo al rechazar la publicación.' });
    } finally {
        client.release();
    }
};

// Asignamos la misma función sin importar si el Frontend usa PUT, PATCH o POST
router.put('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost);
router.patch('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost);
router.post('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost);


// ============================================================================
// 2. MÓDULO DE GESTIÓN DE USUARIOS
// ============================================================================

// GET /api/v1/admin/users -> Búsqueda y listado de cuentas
router.get('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        let sql = `
            SELECT id, nombre_usuario, correo, rol, 
                   (CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END) as estado 
            FROM usuarios 
            WHERE 1=1`;
        const params = [];

        if (q) {
            params.push(`%${q}%`);
            sql += ` AND (nombre_usuario ILIKE $${params.length} OR correo ILIKE $${params.length})`;
        }

        sql += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        res.json({ usuarios: result.rows });
    } catch (err) {
        console.error('Error Administrativo (GET Users):', err);
        res.status(500).json({ error: 'No se pudo obtener el listado de usuarios.' });
    }
});

// PATCH /api/v1/admin/users/:id/status -> Control de acceso de cuentas
router.patch('/users/:id/status', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const { activo } = req.body;
    const adminId = req.user.sub;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING nombre_usuario',
            [activo, targetUserId]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no identificado.' });
        }

        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
             VALUES ($1, $2, 'usuarios', $3, $4)`,
            [adminId, activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO', 
             JSON.stringify({ target_id: targetUserId, username: result.rows[0].nombre_usuario }), 
             req.ip]
        );

        await client.query('COMMIT');
        res.json({ message: `Estado del usuario actualizado a ${activo ? 'Activo' : 'Inactivo'}.` });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error al modificar el estado de la cuenta.' });
    } finally {
        client.release();
    }
});


// ============================================================================
// 3. MÓDULO DE AUDITORÍA
// ============================================================================

// GET /api/v1/admin/audit -> Histórico de transacciones
router.get('/audit', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const { usuario, accion } = req.query;
    try {
        let sql = `
            SELECT a.*, u.nombre_usuario 
            FROM auditoria a 
            JOIN usuarios u ON a.usuario_id = u.id 
            WHERE 1=1`;
        const params = [];

        if (usuario) {
            params.push(`%${usuario}%`);
            sql += ` AND u.nombre_usuario ILIKE $${params.length}`;
        }
        if (accion) {
            params.push(accion);
            sql += ` AND a.accion = $${params.length}`;
        }

        sql += ` ORDER BY a.fecha_creacion DESC LIMIT 50`;
        const result = await query(sql, params);
        res.json({ audit_logs: result.rows });
    } catch (err) {
        console.error('Error Administrativo (Audit):', err);
        res.status(500).json({ error: 'Error al consultar el log de auditoría.' });
    }
});


// ============================================================================
// 4. CONFIGURACIÓN (PALABRAS PROHIBIDAS)
// ============================================================================

// GET /api/v1/admin/config/words -> Gestión de lista JSON
router.get('/config/words', requireAuth, requireRole('ADMIN'), async (req, res) => {
    try {
        const result = await query('SELECT detalles FROM configuracion WHERE clave = $1', ['forbidden_words']);
        res.json(result.rows[0]?.detalles || { words: [] });
    } catch {
        res.json({ words: [] }); 
    }
});

module.exports = router;