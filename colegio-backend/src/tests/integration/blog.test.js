import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import BlogPost from '../../models/blogpost.js';
import { setupDB, clearDB, closeDB } from '../setup.js';
import { createAdminUser, createTestUser, createEditorUser } from '../helpers/auth.js';
import { validBlogPost, draftBlogPost } from '../helpers/fixtures.js';

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

describe('Blog API - /api/blog', () => {
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
  // GET /api/blog - Listar posts
  // ==========================================
  describe('GET /api/blog', () => {
    it('debería obtener posts publicados (público)', async () => {
      const { user } = await createTestUser();
      await BlogPost.create(validBlogPost(user._id, { title: 'Post público 1' }));
      await BlogPost.create(validBlogPost(user._id, { title: 'Post público 2' }));
      await BlogPost.create(draftBlogPost(user._id, { title: 'Borrador oculto' }));

      const res = await request(app).get('/api/blog');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Solo debería mostrar los publicados (no el borrador)
      expect(res.body.count).toBe(2);
    });

    it('debería permitir al admin ver borradores', async () => {
      const { user: admin, token } = await createAdminUser();
      await BlogPost.create(validBlogPost(admin._id, { title: 'Publicado' }));
      await BlogPost.create(draftBlogPost(admin._id, { title: 'Borrador' }));

      const res = await request(app)
        .get('/api/blog?status=borrador')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // El admin puede filtrar por status
      expect(res.body.data.every(p => p.status === 'borrador')).toBe(true);
    });

    it('debería filtrar por categoría', async () => {
      const { user } = await createTestUser();
      await BlogPost.create(validBlogPost(user._id, { category: 'noticias' }));
      await BlogPost.create(validBlogPost(user._id, { title: 'Otro post', category: 'logros' }));

      const res = await request(app).get('/api/blog?category=noticias');

      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.category === 'noticias')).toBe(true);
    });

    it('debería paginar resultados', async () => {
      const { user } = await createTestUser();
      for (let i = 0; i < 5; i++) {
        await BlogPost.create(validBlogPost(user._id, {
          title: `Post ${i}`,
          slug: `post-${i}`,
        }));
      }

      const res = await request(app).get('/api/blog?limit=2&page=1');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.total).toBe(5);
      expect(res.body.pages).toBe(3);
    });
  });

  // ==========================================
  // GET /api/blog/featured - Posts destacados
  // ==========================================
  describe('GET /api/blog/featured', () => {
    it('debería obtener posts destacados', async () => {
      const { user } = await createTestUser();
      await BlogPost.create(validBlogPost(user._id, {
        title: 'Destacado 1',
        isFeatured: true,
      }));
      await BlogPost.create(validBlogPost(user._id, {
        title: 'No destacado',
        slug: 'no-destacado',
        isFeatured: false,
      }));

      const res = await request(app).get('/api/blog/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('debería usar fallback a posts recientes si no hay destacados', async () => {
      const { user } = await createTestUser();
      await BlogPost.create(validBlogPost(user._id, {
        title: 'Post normal',
        isFeatured: false,
      }));

      const res = await request(app).get('/api/blog/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Debería devolver el post aunque no sea featured (fallback)
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('debería devolver array vacío si no hay posts', async () => {
      const res = await request(app).get('/api/blog/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  // ==========================================
  // POST /api/blog - Crear post
  // ==========================================
  describe('POST /api/blog', () => {
    it('debería crear un post (usuario autenticado)', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Nuevo post de test',
          excerpt: 'Extracto del post de test',
          content: 'Contenido completo del post de test para verificar la creación.',
          category: 'noticias',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Nuevo post de test');
      expect(res.body.data.slug).toBeDefined();
      expect(res.body.data.status).toBe('borrador'); // Default
    });

    it('debería rechazar sin autenticación', async () => {
      const res = await request(app)
        .post('/api/blog')
        .send({
          title: 'Sin auth',
          excerpt: 'Sin auth',
          content: 'Sin auth',
        });

      expect(res.status).toBe(401);
    });

    it('debería rechazar post sin campos requeridos', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Solo título' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debería rechazar categoría inválida', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Cat inválida',
          excerpt: 'Test',
          content: 'Test contenido',
          category: 'invalida',
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // PUT /api/blog/:id - Actualizar post
  // ==========================================
  describe('PUT /api/blog/:id', () => {
    it('debería actualizar un post propio', async () => {
      const { user, token } = await createTestUser();
      const post = await BlogPost.create(validBlogPost(user._id));

      const res = await request(app)
        .put(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Título actualizado' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Título actualizado');
    });

    it('debería establecer publishedAt al publicar', async () => {
      const { user, token } = await createTestUser();
      const post = await BlogPost.create(draftBlogPost(user._id));

      const res = await request(app)
        .put(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'publicado' });

      expect(res.status).toBe(200);
      expect(res.body.data.publishedAt).toBeDefined();
    });

    it('debería permitir al admin editar post de otro usuario', async () => {
      const { user: author } = await createTestUser();
      const { token: adminToken } = await createAdminUser();
      const post = await BlogPost.create(validBlogPost(author._id));

      const res = await request(app)
        .put(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Editado por admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Editado por admin');
    });

    it('debería rechazar edición de post ajeno (sin permiso)', async () => {
      const { user: author } = await createTestUser({ email: 'author@test.com' });
      const { token: otherToken } = await createTestUser({ email: 'other@test.com' });
      const post = await BlogPost.create(validBlogPost(author._id));

      const res = await request(app)
        .put(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Intento de edición' });

      expect(res.status).toBe(403);
    });

    it('debería devolver 404 para post inexistente', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/blog/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No existe' });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // DELETE /api/blog/:id - Eliminar post
  // ==========================================
  describe('DELETE /api/blog/:id', () => {
    it('debería eliminar un post propio (editor)', async () => {
      // La ruta DELETE requiere rol 'admin' o 'editor'
      const { user, token } = await createEditorUser();
      const post = await BlogPost.create(validBlogPost(user._id));

      const res = await request(app)
        .delete(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que fue eliminado
      const deleted = await BlogPost.findById(post._id);
      expect(deleted).toBeNull();
    });

    it('debería permitir al admin eliminar cualquier post', async () => {
      const { user: author } = await createTestUser();
      const { token: adminToken } = await createAdminUser();
      const post = await BlogPost.create(validBlogPost(author._id));

      const res = await request(app)
        .delete(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('debería rechazar eliminación de post ajeno', async () => {
      const { user: author } = await createTestUser({ email: 'author2@test.com' });
      const { token: otherToken } = await createTestUser({ email: 'other2@test.com' });
      const post = await BlogPost.create(validBlogPost(author._id));

      const res = await request(app)
        .delete(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // GET /api/blog/category/:category
  // ==========================================
  describe('GET /api/blog/category/:category', () => {
    it('debería obtener posts por categoría', async () => {
      const { user } = await createTestUser();
      await BlogPost.create(validBlogPost(user._id, { category: 'logros', title: 'Logro 1' }));
      await BlogPost.create(validBlogPost(user._id, { category: 'noticias', title: 'Noticia 1', slug: 'noticia-1' }));

      const res = await request(app).get('/api/blog/category/logros');

      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.category === 'logros')).toBe(true);
    });

    it('debería rechazar categoría inválida', async () => {
      const res = await request(app).get('/api/blog/category/invalida');

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /api/blog/:id/like
  // ==========================================
  describe('POST /api/blog/:id/like', () => {
    it('debería incrementar likes de un post', async () => {
      const { user } = await createTestUser();
      const post = await BlogPost.create(validBlogPost(user._id));

      const res = await request(app)
        .post(`/api/blog/${post._id}/like`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.likes).toBe(1);
    });
  });

  // ==========================================
  // GET /api/blog/:identifier - Por ID o slug
  // ==========================================
  describe('GET /api/blog/:identifier', () => {
    it('debería obtener post por ID', async () => {
      const { user } = await createTestUser();
      const post = await BlogPost.create(validBlogPost(user._id));

      const res = await request(app).get(`/api/blog/${post._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(post._id.toString());
    });

    it('debería obtener post por slug', async () => {
      const { user } = await createTestUser();
      const post = await BlogPost.create(validBlogPost(user._id, { slug: 'mi-slug-test' }));

      const res = await request(app).get('/api/blog/mi-slug-test');

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('mi-slug-test');
    });

    it('debería devolver 404 para post inexistente', async () => {
      const res = await request(app).get('/api/blog/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
    });
  });
});
