const request = require('supertest');
const express = require('express');

let mockContexto = { sub: 45, rol: 'USER', ip: '::ffff:127.0.0.1' };

jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = { sub: mockContexto.sub, rol: mockContexto.rol };
    req.ip = mockContexto.ip;
    next();
  },
  requireRole: (roleExigido) => (req, res, next) => {
    if (mockContexto.rol !== roleExigido) {
      return res.status(403).json({ error: 'Acceso denegado. Rol insuficiente.' });
    }
    next();
  }
}));

// 2. Mock de la Base de Datos
const poolModule = require('../BD/pool');
jest.mock('../BD/pool', () => ({
  query: jest.fn(),
  audit: jest.fn().mockResolvedValue(true)
}));

const usersRouter = require('./users');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('Pruebas Unitarias Completas - Módulo de Usuarios y Administración (users.js)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Restablecer el contexto por defecto asegurando el formato de IP correcto
    mockContexto = { sub: 45, rol: 'USER', ip: '::ffff:127.0.0.1' };
  });

  describe('GET /users/me - Mi Perfil Privado', () => {
    test('Debe recuperar la información del perfil y normalizar URLs relativas de posts', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 45, nombre_usuario: 'juan_dev', correo: 'juan@test.com', rol: 'USER' }]
      });
      poolModule.query.mockResolvedValueOnce({
        rows: [
          { id: 1, imagen_url: '/local/foto.png', descripcion: 'Post local', fecha_creacion: new Date() },
          { id: 2, imagen_url: 'https://s3.amazonaws.com/remoto.png', descripcion: 'Post en S3', fecha_creacion: new Date() }
        ]
      });

      const response = await request(app).get('/users/me');

      expect(response.status).toBe(200);
      expect(response.body.user.nombre_usuario).toBe('juan_dev');
      expect(response.body.posts).toHaveLength(2);
      expect(response.body.posts[0].imagen_url).toContain('http');
      expect(response.body.posts[1].imagen_url).toBe('https://s3.amazonaws.com/remoto.png');
    });
  });

  describe('GET /users/check - Disponibilidad de Username y Precedencia', () => {
    test('Debe retornar 409 si el nombre de usuario ya está ocupado', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [{ id: 99 }] });

      const response = await request(app)
        .get('/users/check')
        .query({ username: 'marcos' });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ available: false });
    });

    test('Debe retornar 400 si falta el parámetro username', async () => {
      const response = await request(app).get('/users/check');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Falta username.');
    });
  });

  describe('Rutas de Administración - Roles y Moderación de Contenido', () => {
    test('Debe denegar el acceso a /admin/posts si el rol es común (USER)', async () => {
      mockContexto.rol = 'USER';

      const response = await request(app).get('/users/admin/posts');
      expect(response.status).toBe(403);
    });

    test('PATCH /users/admin/posts/:id/:action - Debe aprobar posts y registrar auditoría', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app).patch('/users/admin/posts/500/approve');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('aprobado');
      
      expect(poolModule.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE publicacion SET estado=$1'),
        ['PUBLICADO', '500']
      );

      expect(poolModule.audit).toHaveBeenCalledWith(
        mockContexto.sub,
        'ADMIN_APPROVE',
        'publicacion',
        { post_id: '500' },
        mockContexto.ip
      );
    });

    test('PUT /users/admin/banned-words - Debe actualizar la lista volátil en memoria', async () => {
      mockContexto.rol = 'ADMIN';
      const nuevaLista = { banned: ['scam', 'malware'] };

      const response = await request(app)
        .put('/users/admin/banned-words')
        .send(nuevaLista);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(nuevaLista);
    });
  });

  describe('GET /users/:id - Inspección de Perfiles Externos', () => {
    test('Debe retornar 404 si el usuario externo no existe o está inactivo', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuario no encontrado.');
    });

    test('Frontera Paramétrica: /check no debe ser interceptado por /:id', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/users/check')
        .query({ username: 'test_user' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available', true);
      
      expect(poolModule.query).not.toHaveBeenCalledWith(
        expect.stringContaining('WHERE id=$1 AND activo=true'),
        expect.any(Array)
      );
    });
  });
});
describe('GET /users/me - Errores', () => {
    test('Debe retornar 500 si la base de datos falla', async () => {
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error al obtener el perfil.');
    });

    test('Debe manejar posts con imagen_url null', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 45, nombre_usuario: 'juan_dev' }]
      });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, imagen_url: null, descripcion: 'Sin imagen' }]
      });
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(200);
      expect(response.body.posts[0].imagen_url).toBeNull();
    });
  });

  describe('GET /users/check - username disponible', () => {
    test('Debe retornar available true si username no existe', async () => {
      poolModule.query.mockResolvedValueOnce({ rows: [] });
      const response = await request(app).get('/users/check').query({ username: 'nuevo_user' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ available: true });
    });
  });

  describe('GET /users/admin/posts - Admin', () => {
    test('Debe retornar posts pendientes como ADMIN', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, imagen_url: '/foto.png', nombre_usuario: 'admin' }]
      });
      const response = await request(app).get('/users/admin/posts');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
    });

    test('Debe retornar 500 si la BD falla en admin/posts', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).get('/users/admin/posts');
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /users/admin/posts/:id/:action - Rechazar post', () => {
    test('Debe rechazar un post correctamente', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({ rowCount: 1 });
      const response = await request(app).patch('/users/admin/posts/500/reject');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('rechazado');
    });

    test('Debe retornar 500 si falla la BD al moderar', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).patch('/users/admin/posts/500/approve');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /users/admin/users - Listar usuarios', () => {
    test('Debe retornar lista de usuarios como ADMIN', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre_usuario: 'admin', correo: 'admin@test.com' }]
      });
      const response = await request(app).get('/users/admin/users');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
    });

    test('Debe retornar 500 si la BD falla en admin/users', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).get('/users/admin/users');
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /users/admin/users/:id/status - Cambiar estado usuario', () => {
    test('Debe activar un usuario correctamente', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({ rowCount: 1 });
      const response = await request(app)
        .patch('/users/admin/users/10/status')
        .send({ activo: true });
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('activado');
    });

    test('Debe desactivar un usuario correctamente', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({ rowCount: 1 });
      const response = await request(app)
        .patch('/users/admin/users/10/status')
        .send({ activo: false });
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('desactivado');
    });

    test('Debe retornar 500 si falla la BD', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app)
        .patch('/users/admin/users/10/status')
        .send({ activo: true });
      expect(response.status).toBe(500);
    });
  });

  describe('GET /users/admin/banned-words', () => {
    test('Debe retornar la lista de palabras prohibidas', async () => {
      mockContexto.rol = 'ADMIN';
      const response = await request(app).get('/users/admin/banned-words');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('banned');
    });
  });

  describe('GET /users/admin/audit', () => {
    test('Debe retornar registros de auditoría', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, accion: 'LOGIN', nombre_usuario: 'admin' }]
      });
      const response = await request(app).get('/users/admin/audit');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('registros');
    });

    test('Debe retornar 500 si falla la BD en audit', async () => {
      mockContexto.rol = 'ADMIN';
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).get('/users/admin/audit');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /users/:id - Perfil externo', () => {
    test('Debe retornar perfil de usuario con posts', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 10, nombre_usuario: 'otro_user', fecha_creacion: new Date() }]
      });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, imagen_url: 'https://s3.com/foto.png', likes_count: 5 }]
      });
      const response = await request(app).get('/users/10');
      expect(response.status).toBe(200);
      expect(response.body.user.nombre_usuario).toBe('otro_user');
    });

    test('Debe manejar posts con imagen_url null en perfil externo', async () => {
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 10, nombre_usuario: 'otro_user' }]
      });
      poolModule.query.mockResolvedValueOnce({
        rows: [{ id: 1, imagen_url: null, likes_count: 0 }]
      });
      const response = await request(app).get('/users/10');
      expect(response.status).toBe(200);
      expect(response.body.posts[0].imagen_url).toBeNull();
    });

    test('Debe retornar 500 si falla la BD en /:id', async () => {
      poolModule.query.mockRejectedValueOnce(new Error('DB Error'));
      const response = await request(app).get('/users/10');
      expect(response.status).toBe(500);
    });
  });