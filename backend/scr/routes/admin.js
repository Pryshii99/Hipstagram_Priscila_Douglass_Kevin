const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── PUT /api/v1/admin/posts/:id/moderate ──
// ACCESO SOLO PARA ADMIN: Modera las publicaciones
router.put('/posts/:id/moderate', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const postId = parseInt(req.params.id);
  const { estado } = req.body; // Esperamos 'PUBLICADO' o 'BLOQUEADO'
  const userId = req.user.sub;
  const ip = req.ip;

  // Validación de seguridad de inputs
  if (!['PUBLICADO', 'BLOQUEADO'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido. Solo se permite PUBLICADO o BLOQUEADO.' });
  }

  // Importamos el pool aquí para manejar la transacción manual
  const client = await require('../BD/pool').pool.connect();
  try {
    await client.query('BEGIN'); // Iniciamos la transacción

    // 1. Verificar que la publicación existe
    const pRes = await client.query('SELECT id, estado FROM publicacion WHERE id = $1', [postId]);
    if (!pRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    const estadoAnterior = pRes.rows[0].estado;

    // 2. Ejecutar la actualización (DML)
    const updateRes = await client.query(
      'UPDATE publicacion SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, postId]
    );

    // 3. Registrar el evento en la tabla de auditoría (Requerimiento de DBA)
    await client.query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
       VALUES ($1, 'MODERACION_POST', 'publicacion', $2, $3)`,
      [
        userId, 
        JSON.stringify({ post_id: postId, estado_anterior: estadoAnterior, nuevo_estado: estado }), 
        ip
      ]
    );

    await client.query('COMMIT'); // Guardamos los cambios permanentemente

    return res.json({ 
      message: `Publicación exitosamente cambiada a ${estado}.`, 
      post: updateRes.rows[0] 
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Si algo falla, abortamos
    console.error('Error en moderación de post:', err);
    return res.status(500).json({ error: 'Error interno del servidor al moderar.' });
  } finally {
    client.release();
  }
});

module.exports = router;