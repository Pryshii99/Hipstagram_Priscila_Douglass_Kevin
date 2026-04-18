const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { query, audit } = require('../BD/pool');
const { requireAuth }  = require('../middleware/auth');

const router = express.Router();

const BCRYPT_ROUNDS  = 12;
const ACCESS_EXPIRY  = '15m';
const REFRESH_EXPIRY = '7d';

// ── Generar tokens ──
function generarTokens(user) {
  const payload = { sub: user.id, nombre_usuario: user.nombre_usuario, rol: user.rol };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
}

// ── POST /auth/register ───
router.post('/register', async (req, res) => {
  const { nombre_usuario, correo, password } = req.body;
  const ip = req.ip;


  if (!nombre_usuario || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (nombre_usuario.length < 3 || nombre_usuario.length > 50) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
  }

  try {

    const existe = await query(
      'SELECT id, correo, nombre_usuario FROM usuarios WHERE correo=$1 OR nombre_usuario=$2',
      [correo.toLowerCase(), nombre_usuario]
    );
    if (existe.rows.length > 0) {
      const u = existe.rows[0];
      if (u.correo === correo.toLowerCase()) {
        return res.status(409).json({ error: 'Este correo ya tiene una cuenta registrada.' });
      }
      return res.status(409).json({ error: `El nombre de usuario @${nombre_usuario} ya está en uso.` });
    }


    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);


    const result = await query(
      `INSERT INTO usuarios (nombre_usuario, correo, password_hash, rol)
       VALUES ($1, $2, $3, 'USER')
       RETURNING id, nombre_usuario, correo, rol, fecha_creacion`,
      [nombre_usuario, correo.toLowerCase(), hash]
    );
    const newUser = result.rows[0];

    // Auditoría
    await audit(newUser.id, 'REGISTRO', 'usuarios', { correo: newUser.correo }, ip);

    // Generar tokens
    const { accessToken, refreshToken } = generarTokens(newUser);


    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      accessToken,
      user: {
        id:             newUser.id,
        nombre_usuario: newUser.nombre_usuario,
        correo:         newUser.correo,
        rol:            newUser.rol,
        fecha_creacion: newUser.fecha_creacion,
      }
    });
  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── POST /auth/login ──
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const ip = req.ip;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const result = await query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    if (!user.activo) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await audit(user.id, 'LOGIN_FALLIDO', 'usuarios', null, ip);
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    await audit(user.id, 'LOGIN_EXITOSO', 'usuarios', null, ip);

    const { accessToken, refreshToken } = generarTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id:             user.id,
        nombre_usuario: user.nombre_usuario,
        correo:         user.correo,
        rol:            user.rol,
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── POST /auth/logout ──
router.post('/logout', requireAuth, async (req, res) => {
  await audit(req.user.sub, 'LOGOUT', 'usuarios', null, req.ip);
  res.clearCookie('refreshToken');
  return res.json({ message: 'Sesión cerrada correctamente.' });
});

// ── POST /auth/refresh ──
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Refresh token no encontrado.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const result  = await query(
      'SELECT id, nombre_usuario, rol, activo FROM usuarios WHERE id=$1',
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido.' });
    }
    const { accessToken, refreshToken: newRefresh } = generarTokens(user);
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7*24*60*60*1000
    });
    return res.json({ accessToken });
  } catch {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Refresh token inválido o expirado.' });
  }
});

// ── GET /users/check?username=x ──
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Falta el parámetro username.' });
  const result = await query('SELECT id FROM usuarios WHERE nombre_usuario=$1', [username]);
  if (result.rows.length > 0) {
    return res.status(409).json({ available: false });
  }
  return res.json({ available: true });
});

module.exports = router;
