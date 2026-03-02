import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import Event from '../../models/event.js';
import { setupDB, clearDB, closeDB } from '../setup.js';
import { createAdminUser, createTestUser, createEditorUser } from '../helpers/auth.js';
import { validEvent, privateEvent, pastEvent } from '../helpers/fixtures.js';

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

describe('Events API - /api/events', () => {
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
  // GET /api/events - Listar eventos
  // ==========================================
  describe('GET /api/events', () => {
    it('debería obtener todos los eventos', async () => {
      const { user } = await createAdminUser();
      await Event.create(validEvent(user._id, { title: 'Evento 1' }));
      await Event.create(validEvent(user._id, { title: 'Evento 2' }));

      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('debería filtrar por categoría', async () => {
      const { user } = await createAdminUser();
      await Event.create(validEvent(user._id, { category: 'academico' }));
      await Event.create(validEvent(user._id, { title: 'Evento 2', category: 'deportivo' }));

      const res = await request(app).get('/api/events?category=academico');

      expect(res.status).toBe(200);
      expect(res.body.data.every(e => e.category === 'academico')).toBe(true);
    });

    it('debería filtrar por isPublic', async () => {
      const { user } = await createAdminUser();
      await Event.create(validEvent(user._id, { isPublic: true }));
      await Event.create(privateEvent(user._id));

      const res = await request(app).get('/api/events?isPublic=true');

      expect(res.status).toBe(200);
      expect(res.body.data.every(e => e.isPublic === true)).toBe(true);
    });
  });

  // ==========================================
  // GET /api/events/upcoming - Eventos próximos
  // ==========================================
  describe('GET /api/events/upcoming', () => {
    it('debería obtener eventos próximos (30 días)', async () => {
      const { user } = await createAdminUser();
      // Evento en 7 días (dentro del rango)
      await Event.create(validEvent(user._id, { title: 'Evento próximo' }));
      // Evento pasado
      await Event.create(pastEvent(user._id));

      const res = await request(app).get('/api/events/upcoming');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('debería usar fallback a eventos recientes si no hay próximos', async () => {
      const { user } = await createAdminUser();
      // Solo eventos pasados
      await Event.create(pastEvent(user._id, { title: 'Pasado 1' }));
      await Event.create(pastEvent(user._id, { title: 'Pasado 2' }));

      const res = await request(app).get('/api/events/upcoming');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // El fallback debería devolver los eventos más recientes
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('debería excluir eventos privados', async () => {
      const { user } = await createAdminUser();
      await Event.create(validEvent(user._id, { title: 'Público' }));
      await Event.create(privateEvent(user._id, {
        title: 'Privado',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 86400000 + 7200000),
      }));

      const res = await request(app).get('/api/events/upcoming');

      expect(res.status).toBe(200);
      // Solo debería devolver el público
      expect(res.body.data.every(e => e.isPublic === true)).toBe(true);
    });

    it('debería devolver array vacío si no hay eventos', async () => {
      const res = await request(app).get('/api/events/upcoming');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  // ==========================================
  // GET /api/events/:id - Obtener por ID
  // ==========================================
  describe('GET /api/events/:id', () => {
    it('debería obtener un evento por ID', async () => {
      const { user } = await createAdminUser();
      const event = await Event.create(validEvent(user._id));

      const res = await request(app).get(`/api/events/${event._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(event._id.toString());
    });

    it('debería devolver 404 para evento inexistente', async () => {
      const res = await request(app).get('/api/events/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
    });

    it('debería devolver 400 para ID inválido', async () => {
      const res = await request(app).get('/api/events/id-invalido');

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /api/events - Crear evento
  // ==========================================
  describe('POST /api/events', () => {
    it('debería crear un evento (admin)', async () => {
      const { token } = await createAdminUser();

      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Nuevo evento test',
          description: 'Descripción del evento de prueba.',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: 'Salón principal',
          category: 'academico',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Nuevo evento test');
    });

    it('debería crear un evento (editor)', async () => {
      const { token } = await createEditorUser();

      const startDate = new Date(Date.now() + 86400000);
      const endDate = new Date(Date.now() + 86400000 + 7200000);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento de editor',
          description: 'Creado por un editor.',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category: 'cultural',
        });

      expect(res.status).toBe(201);
    });

    it('debería rechazar sin autenticación', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Sin auth',
          description: 'Sin auth',
          startDate: new Date(),
          endDate: new Date(),
        });

      expect(res.status).toBe(401);
    });

    it('debería rechazar para rol author', async () => {
      const { token } = await createTestUser({ role: 'author' });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Evento sin permiso',
          description: 'No debería poder crear.',
          startDate: new Date(),
          endDate: new Date(),
        });

      expect(res.status).toBe(403);
    });

    it('debería rechazar sin campos requeridos', async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Solo título' });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // PUT /api/events/:id - Actualizar evento
  // ==========================================
  describe('PUT /api/events/:id', () => {
    it('debería actualizar un evento propio', async () => {
      const { user, token } = await createAdminUser();
      const event = await Event.create(validEvent(user._id));

      const res = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Evento actualizado' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Evento actualizado');
    });

    it('debería permitir al admin editar evento de otro usuario', async () => {
      const { user: editor } = await createEditorUser();
      const { token: adminToken } = await createAdminUser();
      const event = await Event.create(validEvent(editor._id));

      const res = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Editado por admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Editado por admin');
    });

    it('debería rechazar edición por usuario sin permisos', async () => {
      const { user: admin } = await createAdminUser();
      const { token: authorToken } = await createTestUser({ role: 'author' });
      const event = await Event.create(validEvent(admin._id));

      const res = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Sin permisos' });

      // Author no puede editar eventos (no está en authorize('admin', 'editor'))
      expect(res.status).toBe(403);
    });

    it('debería devolver 404 para evento inexistente', async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .put('/api/events/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No existe' });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // DELETE /api/events/:id - Eliminar evento
  // ==========================================
  describe('DELETE /api/events/:id', () => {
    it('debería eliminar un evento propio', async () => {
      const { user, token } = await createAdminUser();
      const event = await Event.create(validEvent(user._id));

      const res = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Event.findById(event._id);
      expect(deleted).toBeNull();
    });

    it('debería rechazar eliminación sin permisos', async () => {
      const { user: admin } = await createAdminUser();
      const { token: authorToken } = await createTestUser({ role: 'author' });
      const event = await Event.create(validEvent(admin._id));

      const res = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // GET /api/events/category/:category
  // ==========================================
  describe('GET /api/events/category/:category', () => {
    it('debería obtener eventos por categoría', async () => {
      const { user } = await createAdminUser();
      await Event.create(validEvent(user._id, { category: 'deportivo', title: 'Deporte' }));
      await Event.create(validEvent(user._id, { category: 'cultural', title: 'Cultura' }));

      const res = await request(app).get('/api/events/category/deportivo');

      expect(res.status).toBe(200);
      expect(res.body.data.every(e => e.category === 'deportivo')).toBe(true);
    });

    it('debería rechazar categoría inválida', async () => {
      const res = await request(app).get('/api/events/category/invalida');

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // GET /api/events/month/:year/:month
  // ==========================================
  describe('GET /api/events/month/:year/:month', () => {
    it('debería obtener eventos del mes', async () => {
      const { user } = await createAdminUser();
      const now = new Date();
      const eventDate = new Date(now.getFullYear(), now.getMonth(), 15);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2);

      await Event.create(validEvent(user._id, {
        title: 'Evento del mes',
        startDate: eventDate,
        endDate: endDate,
      }));

      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const res = await request(app).get(`/api/events/month/${year}/${month}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });
});
