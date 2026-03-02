import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { setupDB, clearDB, closeDB } from '../setup.js';
import { createAdminUser, createTestUser } from '../helpers/auth.js';

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

describe('Validation Middleware', () => {
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
  // Blog Validations
  // ==========================================
  describe('Blog - Validación de entrada', () => {
    it('debería rechazar post con título demasiado largo', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'A'.repeat(201),
          excerpt: 'Extracto válido',
          content: 'Contenido válido para el test de validación.',
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar post con extracto demasiado largo', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Título válido',
          excerpt: 'A'.repeat(301),
          content: 'Contenido válido para el test.',
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar post con categoría inválida', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test categoría',
          excerpt: 'Test',
          content: 'Contenido test',
          category: 'categoria_inexistente',
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar post con status inválido', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test status',
          excerpt: 'Test',
          content: 'Contenido test',
          status: 'estado_invalido',
        });

      expect(res.status).toBe(400);
    });

    it('debería aceptar post con todos los campos válidos', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Post completamente válido',
          excerpt: 'Este extracto es válido.',
          content: 'Este contenido es completamente válido y cumple con todas las validaciones.',
          category: 'noticias',
          status: 'borrador',
          tags: ['test', 'validación'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // Event Validations
  // ==========================================
  describe('Events - Validación de entrada', () => {
    it('debería rechazar evento con título demasiado largo', async () => {
      const { token } = await createAdminUser();
      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'A'.repeat(101),
          description: 'Descripción válida',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar evento con categoría inválida', async () => {
      const { token } = await createAdminUser();
      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento test',
          description: 'Descripción',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category: 'categoria_inexistente',
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar evento con color inválido', async () => {
      const { token } = await createAdminUser();
      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento test',
          description: 'Descripción',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          color: 'no-es-hex',
        });

      expect(res.status).toBe(400);
    });

    it('debería aceptar evento con todos los campos válidos', async () => {
      const { token } = await createAdminUser();
      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento completamente válido',
          description: 'Descripción válida del evento.',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: 'Aula 101',
          category: 'academico',
          color: '#ff5733',
          isPublic: true,
          isAllDay: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // ObjectId Validation
  // ==========================================
  describe('ObjectId - Validación de IDs', () => {
    it('debería rechazar ID de evento inválido en GET', async () => {
      const res = await request(app).get('/api/events/no-es-un-objectid');

      expect(res.status).toBe(400);
    });

    it('debería rechazar ID de blog inválido en like', async () => {
      const res = await request(app).post('/api/blog/no-es-un-objectid/like');

      expect(res.status).toBe(400);
    });

    it('debería aceptar ObjectId válido (aunque no exista)', async () => {
      const res = await request(app).get('/api/events/507f1f77bcf86cd799439011');

      // Debería dar 404 (no encontrado), no 400 (inválido)
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // Query Params Validation
  // ==========================================
  describe('Query Params - Validación de parámetros', () => {
    it('debería aceptar query params válidos para blog', async () => {
      const res = await request(app)
        .get('/api/blog?limit=10&page=1&category=noticias');

      expect(res.status).toBe(200);
    });

    it('debería aceptar query params válidos para events', async () => {
      const res = await request(app)
        .get('/api/events?category=academico&limit=50');

      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // Category Route Params
  // ==========================================
  describe('Category Params - Validación de categorías en ruta', () => {
    it('debería rechazar categoría inválida en blog', async () => {
      const res = await request(app).get('/api/blog/category/inexistente');

      expect(res.status).toBe(400);
    });

    it('debería aceptar categoría válida en blog', async () => {
      const res = await request(app).get('/api/blog/category/noticias');

      expect(res.status).toBe(200);
    });

    it('debería rechazar categoría inválida en eventos', async () => {
      const res = await request(app).get('/api/events/category/inexistente');

      expect(res.status).toBe(400);
    });

    it('debería aceptar categoría válida en eventos', async () => {
      const res = await request(app).get('/api/events/category/academico');

      expect(res.status).toBe(200);
    });
  });
});
