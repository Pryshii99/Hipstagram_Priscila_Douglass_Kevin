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