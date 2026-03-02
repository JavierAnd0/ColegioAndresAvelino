import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { setupDB, clearDB, closeDB } from '../setup.js';
import { createTestUser, createAdminUser, generateExpiredToken } from '../helpers/auth.js';

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

describe('Auth Middleware', () => {
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
  // protect middleware
  // ==========================================
  describe('protect - Rutas protegidas', () => {
    it('debería permitir acceso con token válido', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('debería rechazar sin token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('autenticado');
    });

    it('debería rechazar con token malformado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido-random');

      expect(res.status).toBe(401);
    });

    it('debería rechazar con token expirado', async () => {
      const { user } = await createTestUser();
      const expiredToken = generateExpiredToken(user._id);

      // Esperar 1 segundo para que expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('debería rechazar sin Bearer prefix', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token); // Sin "Bearer"

      expect(res.status).toBe(401);
    });

    it('debería rechazar usuario inactivo', async () => {
      const { user, token } = await createTestUser({ isActive: true });

      // Desactivar el usuario después de crear el token
      user.isActive = false;
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('inactiva');
    });
  });

  // ==========================================
  // authorize middleware
  // ==========================================
  describe('authorize - Control de roles', () => {
    it('debería permitir al admin crear eventos', async () => {
      const { token } = await createAdminUser();

      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento admin',
          description: 'Creado por admin.',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category: 'academico',
        });

      expect(res.status).toBe(201);
    });

    it('debería rechazar al author crear eventos', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento sin permiso',
          description: 'No debería poder.',
          startDate: new Date(),
          endDate: new Date(),
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permiso');
    });

    it('debería permitir al author crear blog posts', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Post de author',
          excerpt: 'Author puede crear posts.',
          content: 'Este contenido es creado por un author con permisos suficientes.',
          category: 'general',
        });

      expect(res.status).toBe(201);
    });
  });

  // ==========================================
  // optionalAuth middleware
  // ==========================================
  describe('optionalAuth - Autenticación opcional', () => {
    it('debería funcionar sin token (público)', async () => {
      const res = await request(app).get('/api/blog');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debería funcionar con token válido', async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .get('/api/blog')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debería funcionar con token inválido (ignora silenciosamente)', async () => {
      const res = await request(app)
        .get('/api/blog')
        .set('Authorization', 'Bearer token-invalido');

      // optionalAuth no bloquea con token inválido
      expect(res.status).toBe(200);
    });
  });
});
