import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/user.js';
import { setupDB, clearDB, closeDB } from '../setup.js';
import { createAdminUser, createTestUser } from '../helpers/auth.js';

// Configurar JWT_SECRET para el entorno de test
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

describe('Auth API - /api/auth', () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  // ==========================================
  // POST /api/auth/login
  // ==========================================
  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      // Crear usuario de prueba
      await createTestUser({ email: 'login@test.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('debería rechazar credenciales inválidas', async () => {
      await createTestUser({ email: 'login@test.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar si falta email o password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar usuario inactivo', async () => {
      await createTestUser({ email: 'inactive@test.com', password: 'password123', isActive: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inactive@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/auth/me
  // ==========================================
  describe('GET /api/auth/me', () => {
    it('debería obtener el perfil del usuario autenticado', async () => {
      const { token } = await createTestUser({ email: 'me@test.com' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe('me@test.com');
    });

    it('debería rechazar sin token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido-123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /api/auth/register
  // ==========================================
  describe('POST /api/auth/register', () => {
    it('debería registrar un usuario nuevo (como admin)', async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nuevo Usuario',
          email: 'nuevo@test.com',
          password: 'password123',
          role: 'editor',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('nuevo@test.com');
      expect(res.body.data.role).toBe('editor');
    });

    it('debería rechazar registro sin ser admin', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'No Admin',
          email: 'noadmin@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar email duplicado', async () => {
      const { token } = await createAdminUser();
      await createTestUser({ email: 'duplicado@test.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Duplicado',
          email: 'duplicado@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // PUT /api/auth/profile
  // ==========================================
  describe('PUT /api/auth/profile', () => {
    it('debería actualizar el perfil del usuario', async () => {
      const { token } = await createTestUser({ name: 'Nombre Original' });

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nombre Actualizado', bio: 'Mi biografía' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Nombre Actualizado');
    });

    it('no debería permitir cambiar el rol desde profile', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      // El rol no debería cambiar porque no está en allowedFields
      expect(res.body.data.role).toBe('author');
    });
  });

  // ==========================================
  // PUT /api/auth/change-password
  // ==========================================
  describe('PUT /api/auth/change-password', () => {
    it('debería cambiar la contraseña con contraseña actual correcta', async () => {
      const { token } = await createTestUser({
        email: 'pwd@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('debería rechazar contraseña actual incorrecta', async () => {
      const { token } = await createTestUser({
        email: 'pwd2@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/auth/users (solo admin)
  // ==========================================
  describe('GET /api/auth/users', () => {
    it('debería listar usuarios (como admin)', async () => {
      const { token } = await createAdminUser();
      await createTestUser({ email: 'user1@test.com' });
      await createTestUser({ email: 'user2@test.com' });

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(3); // admin + 2 users
    });

    it('debería rechazar listar usuarios sin ser admin', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/auth/verify
  // ==========================================
  describe('GET /api/auth/verify', () => {
    it('debería verificar un token válido', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });
  });
});
