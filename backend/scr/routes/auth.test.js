const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'secret_access_test';
process.env.JWT_REFRESH_SECRET = 'secret_refresh_test';
process.env.NODE_ENV = 'development';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hash_simulado_123'),
  compare: jest.fn()
}));

jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = { sub: 1 };
    next();
  }
}));

const poolModule = require('../BD/pool');
jest.mock('../BD/pool', () => ({
  query: jest.fn(),
  audit: jest.fn()
}));

const authRouter = require('./auth');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

describe('Pruebas Unitarias - Módulo de Autenticación (auth.js)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register - Registro de Usuarios', () => {
    test('Debe retornar 400 si los campos obligatorios están ausentes o vacíos', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: '', correo: 'test@test.com', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Todos los campos son obligatorios.');
    });

    test('Debe retornar 400 si el correo no tiene un formato válido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'usuarioTest', correo: 'correoInvalido.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'El correo no tiene un formato válido.');
    });

    test('Debe retornar 409 si el nombre de usuario ya está registrado', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, correo: 'otro@test.com', nombre_usuario: 'usuarioTest' }]
      });

      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'usuarioTest', correo: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('ya está en uso');
    });

    test('Debe registrar exitosamente al usuario (201) y configurar la cookie JWT', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 9, nombre_usuario: 'newuser', correo: 'new@test.com', rol: 'USER', fecha_creacion: '2026-06-08' }]
      });

      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'newuser', correo: 'new@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.nombre_usuario).toBe('newuser');
      
      const cookies = response.headers['set-cookie'][0];
      expect(cookies).toContain('refreshToken=');
      expect(cookies).toContain('HttpOnly');
      
      expect(poolModule.audit).toHaveBeenCalledWith(9, 'REGISTRO', 'usuarios', expect.any(Object), expect.any(String));
    });
  });

  describe('POST /auth/login - Inicio de Sesión', () => {
    test('Debe retornar 403 si el usuario existe pero está desactivado', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 2, correo: 'inactivo@test.com', activo: false }]
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ correo: 'inactivo@test.com', password: 'password123' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Tu cuenta está desactivada. Contacta al administrador.');
    });

    test('Debe retornar 401 y auditar login fallido si la contraseña es incorrecta', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 5, correo: 'test@test.com', password_hash: 'hash', activo: true }]
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/auth/login')
        .send({ correo: 'test@test.com', password: 'claveIncorrecta' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Correo o contraseña incorrectos.');
      expect(poolModule.audit).toHaveBeenCalledWith(5, 'LOGIN_FALLIDO', 'usuarios', null, expect.any(String));
    });
  });

  describe('POST /auth/refresh - Renovación de Tokens', () => {
    test('Debe retornar 401 si no se envía la cookie del refresh token', async () => {
      const response = await request(app).post('/auth/refresh');
      expect(response.status).toBe(401);
    });

    test('Debe limpiar la cookie y dar 401 si el token es inválido o expiró', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=token_invalido_o_expirado']);

      expect(response.status).toBe(401);
      const cookies = response.headers['set-cookie'][0];
      expect(cookies).toContain('refreshToken=;');
    });
  });
});
describe('POST /auth/register - Validaciones adicionales', () => {
    test('Debe retornar 400 si el nombre de usuario es muy corto', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'ab', correo: 'test@test.com', password: 'password123' });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('entre 3 y 50 caracteres');
    });

    test('Debe retornar 400 si la contraseña es menor a 8 caracteres', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'usuario', correo: 'test@test.com', password: '123' });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('al menos 8 caracteres');
    });

    test('Debe retornar 409 si el correo ya está registrado', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, correo: 'test@test.com', nombre_usuario: 'otroUser' }]
      });
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'nuevoUser', correo: 'test@test.com', password: 'password123' });
      expect(response.status).toBe(409);
      expect(response.body.error).toContain('correo');
    });

    test('Debe retornar 500 si la BD falla en registro', async () => {
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app)
        .post('/auth/register')
        .send({ nombre_usuario: 'usuario', correo: 'test@test.com', password: 'password123' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /auth/login - Casos adicionales', () => {
    test('Debe retornar 400 si faltan correo y contraseña', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('obligatorios');
    });

    test('Debe retornar 401 si el usuario no existe', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });
      const response = await request(app)
        .post('/auth/login')
        .send({ correo: 'noexiste@test.com', password: 'password123' });
      expect(response.status).toBe(401);
    });

    test('Debe hacer login exitoso y retornar accessToken', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, correo: 'test@test.com', password_hash: 'hash', activo: true, nombre_usuario: 'user', rol: 'USER' }]
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      poolModule.audit.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/auth/login')
        .send({ correo: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.nombre_usuario).toBe('user');
    });

    test('Debe retornar 500 si la BD falla en login', async () => {
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app)
        .post('/auth/login')
        .send({ correo: 'test@test.com', password: 'password123' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /auth/logout', () => {
    test('Debe cerrar sesión correctamente', async () => {
      poolModule.audit.mockResolvedValueOnce(true);
      const response = await request(app).post('/auth/logout');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('cerrada');
    });
  });

  describe('POST /auth/refresh - Casos adicionales', () => {
    test('Debe renovar el token si el refresh token es válido', async () => {
      const validToken = jwt.sign({ sub: 1 }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre_usuario: 'user', rol: 'USER', activo: true }]
      });

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${validToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    test('Debe retornar 401 si el usuario está inactivo', async () => {
      const validToken = jwt.sign({ sub: 1 }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre_usuario: 'user', rol: 'USER', activo: false }]
      });

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${validToken}`]);

      expect(response.status).toBe(401);
    });

    test('Debe retornar 401 si el usuario no existe', async () => {
      const validToken = jwt.sign({ sub: 99 }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      poolModule.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${validToken}`]);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/check-username', () => {
    test('Debe retornar 400 si falta el parámetro username', async () => {
      const response = await request(app).get('/auth/check-username');
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
    });

    test('Debe retornar 409 si el username ya existe', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const response = await request(app)
        .get('/auth/check-username')
        .query({ username: 'existente' });
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ available: false });
    });

    test('Debe retornar available true si el username no existe', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });
      const response = await request(app)
        .get('/auth/check-username')
        .query({ username: 'nuevo' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ available: true });
    });
  });