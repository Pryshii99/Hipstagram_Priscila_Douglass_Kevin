const express = require('express');
const { query, audit }       = require('../BD/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── GET /users/me ──
router.get('/me', requireAuth, async (req, res) => {
  try {
    const uRes = await query(
      'SELECT id, nombre_usuario, correo, rol, activo, fecha_creacion FROM usuarios WHERE id=$1',
      [req.user.sub]
    );
    const pRes = await query(
      `SELECT p.id, p.imagen_url, p.descripcion, p.likes_count, p.dislikes_count, p.estado, p.fecha_creacion
       FROM publicacion p WHERE p.usuario_id=$1 ORDER BY p.fecha_creacion DESC`,
      [req.user.sub]
    );
    return res.json({ user: uRes.rows[0], posts: pRes.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});

// ── GET /users/check?username=x  ← DEBE ir ANTES de /:id ──
router.get('/check', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Falta username.' });
  const result = await query('SELECT id FROM usuarios WHERE nombre_usuario=$1', [username]);
  if (result.rows.length > 0) return res.status(409).json({ available: false });
  return res.json({ available: true });
});

// ── ADMIN rutas  ← DEBEN ir ANTES de /:id ──
router.get('/admin/posts', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const estado = req.query.estado || 'PENDIENTE';
  const page   = parseInt(req.query.page || '1');
  const offset = (page - 1) * 10;
  try {
    const result = await query(`
      SELECT p.*, u.nombre_usuario
      FROM publicacion p JOIN usuarios u ON u.id=p.usuario_id
      WHERE p.estado=$1 ORDER BY p.fecha_creacion DESC LIMIT 10 OFFSET $2
    `, [estado, offset]);
    return res.json({ posts: result.rows });
  } catch (err) { return res.status(500).json({ error: 'Error.' }); }
});

router.patch('/admin/posts/:id/:action', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id, action } = req.params;
  const estado = action === 'approve' ? 'PUBLICADO' : 'BLOQUEADO';
  try {
    await query('UPDATE publicacion SET estado=$1 WHERE id=$2', [estado, id]);
    await audit(req.user.sub, `ADMIN_${action.toUpperCase()}`, 'publicacion', { post_id: id }, req.ip);
    return res.json({ message: `Post ${action === 'approve' ? 'aprobado' : 'rechazado'}.` });
  } catch { return res.status(500).json({ error: 'Error al moderar.' }); }
});

router.get('/admin/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const q    = req.query.q || '';
  const page = parseInt(req.query.page || '1');
  const offset = (page - 1) * 20;
  try {
    const result = await query(
      `SELECT id, nombre_usuario, correo, rol, activo, fecha_creacion FROM usuarios
       WHERE nombre_usuario ILIKE $1 OR correo ILIKE $1
       ORDER BY fecha_creacion DESC LIMIT 20 OFFSET $2`,
      [`%${q}%`, offset]
    );
    return res.json({ users: result.rows });
  } catch { return res.status(500).json({ error: 'Error.' }); }
});

router.patch('/admin/users/:id/status', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { activo } = req.body;
  try {
    await query('UPDATE usuarios SET activo=$1 WHERE id=$2', [activo, req.params.id]);
    await audit(req.user.sub, activo ? 'ADMIN_ACTIVAR_USER' : 'ADMIN_DESACTIVAR_USER',
      'usuarios', { user_id: req.params.id }, req.ip);
    return res.json({ message: `Usuario ${activo ? 'activado' : 'desactivado'}.` });
  } catch { return res.status(500).json({ error: 'Error.' }); }
});

let bannedWords = { banned: ['spam','nsfw','odio','violencia'] };

router.get('/admin/banned-words', requireAuth, requireRole('ADMIN'), (_, res) => {
  res.json(bannedWords);
});
router.put('/admin/banned-words', requireAuth, requireRole('ADMIN'), async (req, res) => {
  bannedWords = req.body;
  await audit(req.user.sub, 'BANNED_WORDS_UPDATE', 'sistema', bannedWords, req.ip);
  res.json({ message: 'Lista actualizada.', data: bannedWords });
});

router.get('/admin/audit', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const offset = (page - 1) * 20;
  try {
    const result = await query(`
      SELECT a.*, u.nombre_usuario FROM auditoria a
      LEFT JOIN usuarios u ON u.id=a.usuario_id
      ORDER BY a.fecha_creacion DESC LIMIT 20 OFFSET $1
    `, [offset]);
    return res.json({ registros: result.rows });
  } catch { return res.status(500).json({ error: 'Error.' }); }
});

// ── GET /users/:id  ← AL FINAL ──
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const uRes = await query(
      'SELECT id, nombre_usuario, fecha_creacion FROM usuarios WHERE id=$1 AND activo=true',
      [req.params.id]
    );
    if (!uRes.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const pRes = await query(
      `SELECT id, imagen_url, likes_count FROM publicacion WHERE usuario_id=$1 AND estado='PUBLICADO' ORDER BY likes_count DESC`,
      [req.params.id]
    );
    return res.json({ user: uRes.rows[0], posts: pRes.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
