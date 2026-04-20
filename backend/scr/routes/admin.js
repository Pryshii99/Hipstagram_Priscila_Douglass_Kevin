const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { query, pool } = require('../BD/pool');

const router = express.Router();

// ============================================================================
// 1. MÓDULO DE MODERACIÓN DE CONTENIDO
// ============================================================================

// GET /api/v1/admin/posts -> Lista publicaciones según su estado [cite: 119, 127]
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
        await client.query('BEGIN'); // Inicio de transacción (Rol DBA) [cite: 211, 217]
        const pRes = await client.query('SELECT id, estado FROM publicacion WHERE id = $1', [postId]);
        
        if (!pRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const updateRes = await client.query(
            "UPDATE publicacion SET estado = 'PUBLICADO' WHERE id = $1 RETURNING *",
            [postId]
        );

        // Registro en auditoría [cite: 205, 208]
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

        // Registro en auditoría [cite: 205, 208]
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

// ── 1.C LÓGICA UNIVERSAL PARA BLOQUEAR POSTS YA PUBLICADOS ──
const bloquearPost = async (req, res) => {
    const postId = parseInt(req.params.id);
    const adminId = req.user.sub;
    const ip = req.ip;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pRes = await client.query('SELECT id FROM publicacion WHERE id = $1', [postId]);
        if (!pRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const updateRes = await client.query(
            "UPDATE publicacion SET estado = 'BLOQUEADO' WHERE id = $1 RETURNING *",
            [postId]
        );

        // Auditoría [cite: 149, 208]
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
             VALUES ($1, 'BLOQUEAR_POST', 'publicacion', $2, $3)`,
            [adminId, JSON.stringify({ post_id: postId, anterior_estado: 'PUBLICADO' }), ip]
        );

        await client.query('COMMIT');
        res.json({ message: 'Publicación bloqueada con éxito.', post: updateRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al bloquear post:', err);
        res.status(500).json({ error: 'Fallo al bloquear la publicación.' });
    } finally {
        client.release();
    }
};


// Asignación de rutas de moderación (Soportando POST, PUT y PATCH para compatibilidad Frontend)
router.post('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost);
router.put('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost);
router.patch('/posts/:id/approve', requireAuth, requireRole('ADMIN'), aprobarPost); // <- NUEVO

router.post('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost);
router.put('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost);
router.patch('/posts/:id/reject', requireAuth, requireRole('ADMIN'), rechazarPost); // <- NUEVO

router.post('/posts/:id/block', requireAuth, requireRole('ADMIN'), bloquearPost);
router.put('/posts/:id/block', requireAuth, requireRole('ADMIN'), bloquearPost);
router.patch('/posts/:id/block', requireAuth, requireRole('ADMIN'), bloquearPost); // <- NUEVO


// ============================================================================
// 2. MÓDULO DE GESTIÓN DE USUARIOS
// ============================================================================

// GET /api/v1/admin/users -> Búsqueda y listado de cuentas [cite: 119, 125]
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
        console.log(`[DB Query] Usuarios recuperados: ${result.rows.length}`);

        res.json({ 
            usuarios: result.rows,
            users: result.rows, 
            total: result.rowCount 
        });
    } catch (err) {
        console.error('Error Administrativo (GET Users):', err);
        res.status(500).json({ error: 'No se pudo obtener el listado de usuarios.' });
    }
});

// PATCH /api/v1/admin/users/:id/status -> Control de acceso de cuentas [cite: 119, 208]
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

        // Auditoría [cite: 149, 208]
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

// GET /api/v1/admin/audit -> Histórico de transacciones [cite: 121, 149, 199-201]
router.get('/audit', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const { usuario, accion } = req.query;
    try {
        let sql = `
            SELECT a.id, a.fecha_creacion, a.accion, a.tabla_afectada, a.direccion_ip, 
                   COALESCE(u.nombre_usuario, 'Sistema/Eliminado') as nombre_usuario 
            FROM auditoria a 
            LEFT JOIN usuarios u ON a.usuario_id = u.id 
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
        
        // Enviamos el arreglo bajo múltiples nombres para "engañar" al Frontend
        res.json({ 
            audit_logs: result.rows,
            logs: result.rows,
            auditoria: result.rows,
            registros: result.rows,
            total: result.rowCount 
        });
    } catch (err) {
        console.error('Error Administrativo (Audit):', err);
        res.status(500).json({ error: 'Error al consultar el log de auditoría.' });
    }
});

// ============================================================================
// 4. CONFIGURACIÓN (PALABRAS PROHIBIDAS)
// ============================================================================

// GET /api/v1/admin/banned-words -> Gestión de lista JSON [cite: 120, 130]
router.get('/banned-words', requireAuth, requireRole('ADMIN'), async (req, res) => {
    try {
        const result = await query('SELECT detalles FROM configuracion WHERE clave = $1', ['forbidden_words']);
        res.json(result.rows[0]?.detalles || { banned: [] });
    } catch {
        res.json({ banned: [] }); 
    }
});

// LÓGICA UNIVERSAL PARA GUARDAR PALABRAS [cite: 120, 208]
const guardarPalabras = async (req, res) => {
    const { banned } = req.body;
    const adminId = req.user.sub;

    if (!Array.isArray(banned)) {
        return res.status(400).json({ error: 'El JSON debe contener un arreglo llamado "banned".' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            INSERT INTO configuracion (clave, detalles) 
            VALUES ('forbidden_words', $1) 
            ON CONFLICT (clave) 
            DO UPDATE SET detalles = EXCLUDED.detalles
        `, [JSON.stringify({ banned })]);

        // Auditoría [cite: 208]
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
             VALUES ($1, 'ACTUALIZAR_PALABRAS_PROHIBIDAS', 'configuracion', $2, $3)`,
            [adminId, JSON.stringify({ accion: 'actualización de filtro', cantidad: banned.length }), req.ip]
        );

        await client.query('COMMIT');
        res.json({ message: 'Lista de palabras prohibidas actualizada correctamente.', banned });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al guardar palabras prohibidas:', err);
        res.status(500).json({ error: 'Fallo al actualizar la configuración.' });
    } finally {
        client.release();
    }
};

router.post('/banned-words', requireAuth, requireRole('ADMIN'), guardarPalabras);
router.put('/banned-words', requireAuth, requireRole('ADMIN'), guardarPalabras);

module.exports = router;