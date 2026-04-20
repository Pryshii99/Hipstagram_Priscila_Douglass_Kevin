const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { query, audit }       = require('../BD/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Configuración de Multer (almacenamiento local) ──
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, file, cb) => {
    const allowed = ['.jpg','.jpeg','.png','.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'));
  }
});

// ── GET /posts/feed ──
router.get('/feed', requireAuth, async (req, res) => {
  const page  = parseInt(req.query.page  || '1');
  const limit = parseInt(req.query.limit || '10');
  const offset = (page - 1) * limit;
  const userId = req.user.sub;

  try {
    const result = await query(`
      SELECT
        p.id, p.descripcion, p.imagen_url, p.likes_count, p.dislikes_count,
        p.estado, p.fecha_creacion,
        u.nombre_usuario,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS total_comentarios,
        (SELECT tipo_voto FROM votos v WHERE v.publicacion_id = p.id AND v.usuario_id = $3) AS mi_voto,
        COALESCE(
          (SELECT array_agg(h.nombre) FROM publicacion_hashtags ph
           JOIN hashtags h ON h.id = ph.hashtag_id
           WHERE ph.publicacion_id = p.id), '{}'
        ) AS hashtags
      FROM publicacion p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.estado = 'PUBLICADO'
      ORDER BY p.likes_count DESC, p.fecha_creacion DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset, userId]);

    return res.json({ posts: result.rows, page, limit });
  } catch (err) {
    console.error('Error en feed:', err);
    return res.status(500).json({ error: 'Error al obtener el feed.' });
  }
});

// ── GET /posts/explore ──
router.get('/explore', requireAuth, async (req, res) => {
  const page  = parseInt(req.query.page  || '1');
  const limit = parseInt(req.query.limit || '10');
  const offset = (page - 1) * limit;
  const userId = req.user.sub;

  try {
    const result = await query(`
      SELECT
        p.id, p.descripcion, p.imagen_url, p.likes_count, p.dislikes_count,
        p.fecha_creacion, u.nombre_usuario,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS total_comentarios,
        (SELECT tipo_voto FROM votos v WHERE v.publicacion_id=p.id AND v.usuario_id=$3) AS mi_voto,
        COALESCE(
          (SELECT array_agg(h.nombre) FROM publicacion_hashtags ph
           JOIN hashtags h ON h.id = ph.hashtag_id 
           WHERE ph.publicacion_id = p.id), '{}'
        ) AS hashtags
      FROM publicacion p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.estado = 'PUBLICADO'
      ORDER BY p.likes_count DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset, userId]);

    return res.json({ posts: result.rows });
  } catch (err) {
    console.error('Error en explore:', err);
    return res.status(500).json({ error: 'Error al obtener explorar.' });
  }
});

// ── GET /search/hashtag ──
router.get('/search/hashtag', requireAuth, async (req, res) => {
  const q    = (req.query.q || '').toLowerCase().trim();
  const page = parseInt(req.query.page || '1');
  const offset = (page - 1) * 10;

  if (!q) return res.status(400).json({ error: 'Parámetro q requerido.' });

  try {
    const result = await query(`
      SELECT p.id, p.imagen_url, p.descripcion, p.likes_count, p.fecha_creacion, u.nombre_usuario
      FROM publicacion p
      JOIN usuarios u ON u.id=p.usuario_id
      JOIN publicacion_hashtags ph ON ph.publicacion_id=p.id
      JOIN hashtags h ON h.id=ph.hashtag_id
      WHERE h.nombre=$1 AND p.estado='PUBLICADO'
      ORDER BY p.likes_count DESC
      LIMIT 10 OFFSET $2
    `, [q.startsWith('#') ? q : '#'+q, offset]);

    return res.json({ posts: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en búsqueda.' });
  }
});

// ── GET /search ──
router.get('/search', requireAuth, async (req, res) => {
  const q      = (req.query.q || '').trim();
  const page   = parseInt(req.query.page || '1');
  const offset = (page - 1) * 10;

  if (!q) return res.status(400).json({ error: 'Parámetro q requerido.' });

  try {
    const result = await query(`
      SELECT DISTINCT p.id, p.imagen_url, p.descripcion, p.likes_count, p.fecha_creacion, u.nombre_usuario
      FROM publicacion p JOIN usuarios u ON u.id=p.usuario_id
      WHERE p.estado='PUBLICADO'
        AND (p.descripcion ILIKE $1
          OR EXISTS (
            SELECT 1 FROM publicacion_hashtags ph
            JOIN hashtags h ON h.id=ph.hashtag_id
            WHERE ph.publicacion_id=p.id AND h.nombre ILIKE $1
          ))
      ORDER BY p.likes_count DESC
      LIMIT 10 OFFSET $2
    `, [`%${q}%`, offset]);

    return res.json({ posts: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en búsqueda.' });
  }
});

// ── GET /comments/:postId ──
router.get('/comments/:postId', requireAuth, async (req, res) => {
  const postId = parseInt(req.params.postId);
  const page   = parseInt(req.query.page  || '1');
  const limit  = parseInt(req.query.limit || '20');
  const offset = (page - 1) * limit;

  try {
    const result = await query(`
      SELECT c.id, c.contenido, c.fecha_creacion, u.nombre_usuario
      FROM comentarios c JOIN usuarios u ON u.id=c.usuario_id
      WHERE c.publicacion_id=$1
      ORDER BY c.fecha_creacion ASC
      LIMIT $2 OFFSET $3
    `, [postId, limit, offset]);

    return res.json({ comentarios: result.rows, page });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener comentarios.' });
  }
});

// ── GET /posts/:id ──
router.get('/:id', requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.sub;

  try {
    const pRes = await query(`
      SELECT p.*, u.nombre_usuario,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id=p.id) AS total_comentarios,
        (SELECT tipo_voto FROM votos v WHERE v.publicacion_id=p.id AND v.usuario_id=$2) AS mi_voto,
        COALESCE(
          (SELECT array_agg(h.nombre) FROM publicacion_hashtags ph
           JOIN hashtags h ON h.id=ph.hashtag_id WHERE ph.publicacion_id=p.id), '{}'
        ) AS hashtags
      FROM publicacion p JOIN usuarios u ON u.id=p.usuario_id
      WHERE p.id=$1 AND p.estado='PUBLICADO'
    `, [postId, userId]);

    if (!pRes.rows[0]) return res.status(404).json({ error: 'Publicación no encontrada.' });
    return res.json(pRes.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener la publicación.' });
  }
});

// ── POST /posts (MÓDULO DE AUTO-MODERACIÓN INTEGRADO) ──
router.post('/', requireAuth, upload.single('imagen'), async (req, res) => {
  const userId = req.user.sub;
  const ip     = req.ip;

  if (!req.file) {
    return res.status(400).json({ error: 'Debes subir una imagen.' });
  }

  const descripcion = (req.body.descripcion || '').substring(0, 128);
  const imagenUrl   = `/uploads/${req.file.filename}`;

  let hashtags = [];
  try { hashtags = JSON.parse(req.body.hashtags || '[]'); } catch {}
  if (!Array.isArray(hashtags)) hashtags = [];
  hashtags = hashtags.slice(0, 10).map(h => h.toLowerCase().trim());

  const client = await require('../BD/pool').pool.connect();
  try {
    await client.query('BEGIN');

    // 1. --- LOGICA DE AUTO-MODERACIÓN ---
    let estadoPost = 'PENDIENTE'; 
    let bannedWords = [];
    
    try {
        const configRes = await client.query("SELECT detalles FROM configuracion WHERE clave = 'forbidden_words'");
        if (configRes.rows[0] && configRes.rows[0].detalles.banned) {
            bannedWords = configRes.rows[0].detalles.banned.map(w => w.toLowerCase());
        }
    } catch (err) {
        console.error('Error al leer palabras prohibidas:', err);
    }

    const descLower = descripcion.toLowerCase();
    const contieneProhibidas = bannedWords.some(word => 
        descLower.includes(word) || hashtags.some(h => h.includes(word))
    );

    if (contieneProhibidas) {
        estadoPost = 'BLOQUEADO'; 
    }

    // 2. --- INSERCIÓN EN BD ---
    const pRes = await client.query(
        "INSERT INTO publicacion (usuario_id, imagen_url, descripcion, estado) VALUES ($1, $2, $3, $4) RETURNING *", 
        [userId, imagenUrl, descripcion || null, estadoPost]
    );
    const post = pRes.rows[0];

    // 3. --- GUARDADO DE HASHTAGS ---
    await client.query('SAVEPOINT sp_hashtags');
    try {
      for (const nombre of hashtags) {
        if (!nombre.match(/^#[a-záéíóúñüa-z0-9_]{1,49}$/i)) continue;
        await client.query(
          'INSERT INTO hashtags (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING',
          [nombre]
        );
        const hRes = await client.query('SELECT id FROM hashtags WHERE nombre=$1', [nombre]);
        if (hRes.rows[0]) {
          await client.query(
            'INSERT INTO publicacion_hashtags (publicacion_id, hashtag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
            [post.id, hRes.rows[0].id]
          );
        }
      }
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT sp_hashtags');
    }

    // 4. --- AUDITORÍA DETALLADA ---
    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
       VALUES ($1, $2, 'publicacion', $3, $4)`,
      [
          userId, 
          contieneProhibidas ? 'POST_AUTO_BLOQUEADO' : 'POST_CREADO', 
          JSON.stringify({ post_id: post.id, motivo: contieneProhibidas ? 'Filtro automático' : 'Normal' }), 
          ip
      ]
    );

    await client.query('COMMIT');

    if (contieneProhibidas) {
        return res.status(403).json({ error: 'Tu publicación ha sido retenida por contener lenguaje no permitido.' });
    }

    return res.status(201).json({ message: 'Publicación creada y enviada a revisión.', post });

  } catch (err) {
    await client.query('ROLLBACK');
    try {
        if (req.file) fs.unlinkSync(req.file.path);
    } catch (e) {
        console.error('Error al limpiar archivo huerfano:', e);
    }
    console.error('Error al crear post:', err);
    return res.status(500).json({ error: 'Error al procesar la publicación.' });
  } finally {
    client.release();
  }
});

// =========================================================================
// 🚀 ¡AQUÍ ESTÁ LA CORRECCIÓN! LA RUTA ESPECÍFICA DEBE IR ANTES
// =========================================================================
// ── DELETE /comments/:id (Eliminar comentario - Rol DBA) ──
router.delete('/comments/:id', requireAuth, async (req, res) => {
  const commentId = parseInt(req.params.id);
  const userId = req.user.sub;
  const ip = req.ip;

  const client = await require('../BD/pool').pool.connect();
  try {
    await client.query('BEGIN'); // Iniciamos transacción

    // 1. Verificamos que el comentario exista y le pertenezca al usuario
    const cRes = await client.query(
      'SELECT usuario_id, publicacion_id FROM comentarios WHERE id=$1', 
      [commentId]
    );

    if (!cRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Comentario no encontrado.' });
    }

    if (cRes.rows[0].usuario_id !== userId && req.user.rol !== 'ADMIN') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario.' });
    }

    const postId = cRes.rows[0].publicacion_id;

    // 2. Eliminamos físicamente el comentario [cite: 250]
    await client.query('DELETE FROM comentarios WHERE id=$1', [commentId]);

    // 3. Dejamos rastro en la Auditoría 
    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
       VALUES ($1, 'COMENTARIO_ELIMINADO', 'comentarios', $2, $3)`,
      [userId, JSON.stringify({ comment_id: commentId, post_id: postId }), ip]
    );

    await client.query('COMMIT');
    return res.json({ message: 'Comentario eliminado exitosamente.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar comentario:', err);
    return res.status(500).json({ error: 'Error interno al intentar eliminar el comentario.' });
  } finally {
    client.release();
  }
});


// =========================================================================
// 🛑 LUEGO VIENE LA RUTA COMODÍN GENERAL
// =========================================================================
// ── DELETE /posts/:id (MEJORADO CON TRANSACCIONES - ROL DBA) ──
router.delete('/:id', requireAuth, async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.sub; 

    const client = await require('../BD/pool').pool.connect();
    try {
        await client.query('BEGIN'); // Transacción iniciada

        // Verificar propiedad
        const pRes = await client.query('SELECT usuario_id FROM publicacion WHERE id=$1', [postId]);
        
        if (!pRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }
        if (pRes.rows[0].usuario_id !== userId && req.user.rol !== 'ADMIN') {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'No puedes eliminar una publicación que no es tuya.' });
        }

        // Intento de borrado
        await client.query('DELETE FROM publicacion WHERE id=$1', [postId]);
        
        // Auditoría
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip) 
             VALUES ($1, 'POST_ELIMINADO', 'publicacion', $2, $3)`,
            [userId, JSON.stringify({ post_id: postId }), req.ip]
        );

        await client.query('COMMIT'); // Se completó con éxito
        return res.json({ message: 'Publicación eliminada.' });
        
    } catch (err) {
        await client.query('ROLLBACK'); // Algo falló, deshacemos
        
        // Captura explícita de error de clave foránea en Postgres
        if (err.code === '23503') {
            return res.status(409).json({ error: 'No se puede eliminar porque existen registros dependientes (comentarios o likes).' });
        }
        
        console.error(err);
        return res.status(500).json({ error: 'Error al eliminar.' });
    } finally {
        client.release();
    }
});


// ── POST /votes/:postId ──
router.post('/votes/:postId', requireAuth, async (req, res) => {
  const postId   = parseInt(req.params.postId);
  const userId   = req.user.sub;
  const tipoVoto = parseInt(req.body.tipo_voto);
  const ip       = req.ip;

  if (![0, 1].includes(tipoVoto)) {
    return res.status(400).json({ error: 'tipo_voto debe ser 0 (dislike) o 1 (like).' });
  }

  const client = await require('../BD/pool').pool.connect();
  try {
    await client.query('BEGIN');
    const pRes = await client.query(
      "SELECT usuario_id FROM publicacion WHERE id=$1 AND estado='PUBLICADO'", 
      [postId]
    );
    
    if (!pRes.rows[0]) { 
      await client.query('ROLLBACK'); 
      return res.status(404).json({ error: 'Publicación no encontrada o en revisión.' }); 
    }
    
    if (pRes.rows[0].usuario_id === userId) { 
      await client.query('ROLLBACK'); 
      return res.status(400).json({ error: 'No puedes votar tu propia publicación.' }); 
    }
    const vRes = await client.query(
      'SELECT tipo_voto FROM votos WHERE usuario_id=$1 AND publicacion_id=$2 FOR UPDATE',
      [userId, postId]
    );
    const prev = vRes.rows[0];

    if (!prev) {
      await client.query('INSERT INTO votos (publicacion_id, usuario_id, tipo_voto) VALUES ($1,$2,$3)', [postId, userId, tipoVoto]);
      if (tipoVoto === 1) await client.query('UPDATE publicacion SET likes_count=likes_count+1 WHERE id=$1', [postId]);
      else                await client.query('UPDATE publicacion SET dislikes_count=dislikes_count+1 WHERE id=$1', [postId]);
    } else if (prev.tipo_voto !== tipoVoto) {
      await client.query('UPDATE votos SET tipo_voto=$1 WHERE usuario_id=$2 AND publicacion_id=$3', [tipoVoto, userId, postId]);
      if (tipoVoto === 1) await client.query('UPDATE publicacion SET likes_count=likes_count+1, dislikes_count=GREATEST(dislikes_count-1,0) WHERE id=$1', [postId]);
      else                await client.query('UPDATE publicacion SET dislikes_count=dislikes_count+1, likes_count=GREATEST(likes_count-1,0) WHERE id=$1', [postId]);
    }

    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
       VALUES ($1,'VOTO','votos',$2,$3)`,
      [userId, JSON.stringify({ post_id: postId, tipo: tipoVoto }), ip]
    );

    await client.query('COMMIT');

    const updated = await query('SELECT likes_count, dislikes_count FROM publicacion WHERE id=$1', [postId]);
    return res.json({ ...updated.rows[0], mi_voto: tipoVoto });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar el voto.' });
  } finally {
    client.release();
  }
});

// ── POST /comments/:postId ──
router.post('/comments/:postId', requireAuth, async (req, res) => {
  const postId   = parseInt(req.params.postId);
  const userId   = req.user.sub;
  const contenido = (req.body.contenido || '').trim().substring(0, 500);
  const ip        = req.ip;

  if (!contenido) return res.status(400).json({ error: 'El comentario no puede estar vacío.' });

  try {
    const pRes = await query('SELECT id FROM publicacion WHERE id=$1 AND estado=$2', [postId, 'PUBLICADO']);
    if (!pRes.rows[0]) return res.status(404).json({ error: 'Publicación no encontrada.' });

    const cRes = await query(
      `INSERT INTO comentarios (publicacion_id, usuario_id, contenido)
       VALUES ($1,$2,$3) RETURNING *`,
      [postId, userId, contenido]
    );
    await audit(userId, 'COMENTARIO_CREADO', 'comentarios', { post_id: postId }, ip);

    const cWithUser = await query(
      `SELECT c.*, u.nombre_usuario FROM comentarios c JOIN usuarios u ON u.id=c.usuario_id WHERE c.id=$1`,
      [cRes.rows[0].id]
    );
    return res.status(201).json({ comentario: cWithUser.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear el comentario.' });
  }
});

module.exports = router;