/**
 * Fixtures de datos para tests
 * Proporciona datos válidos de ejemplo para crear entidades
 */

/**
 * Datos válidos para crear un blog post
 */
export function validBlogPost(authorId, overrides = {}) {
  return {
    title: 'Post de prueba para testing',
    excerpt: 'Este es un extracto de prueba para el post.',
    content: 'Este es el contenido completo del post de prueba. Tiene suficiente texto para ser válido.',
    category: 'noticias',
    status: 'publicado',
    publishedAt: new Date(),
    tags: ['test', 'prueba'],
    author: authorId,
    isFeatured: false,
    ...overrides,
  };
}

/**
 * Datos válidos para crear un blog post en borrador
 */
export function draftBlogPost(authorId, overrides = {}) {
  return validBlogPost(authorId, {
    title: 'Post borrador de prueba',
    status: 'borrador',
    publishedAt: undefined,
    ...overrides,
  });
}

/**
 * Datos válidos para crear un evento
 */
export function validEvent(createdById, overrides = {}) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // 1 semana en el futuro

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2); // 2 horas después

  return {
    title: 'Evento de prueba',
    description: 'Descripción del evento de prueba para testing.',
    startDate,
    endDate,
    location: 'Aula Principal',
    category: 'academico',
    isPublic: true,
    isAllDay: false,
    color: '#3b82f6',
    createdBy: createdById,
    ...overrides,
  };
}

/**
 * Datos válidos para crear un evento privado
 */
export function privateEvent(createdById, overrides = {}) {
  return validEvent(createdById, {
    title: 'Evento privado de prueba',
    isPublic: false,
    ...overrides,
  });
}

/**
 * Datos válidos para crear un evento pasado
 */
export function pastEvent(createdById, overrides = {}) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 días en el pasado

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);

  return validEvent(createdById, {
    title: 'Evento pasado de prueba',
    startDate,
    endDate,
    ...overrides,
  });
}

/**
 * Datos para request body de login
 */
export function loginCredentials(email = 'test@example.com', password = 'password123') {
  return { email, password };
}

/**
 * Datos inválidos para testing de validación
 */
export const invalidData = {
  blogPost: {
    noTitle: { excerpt: 'Un extracto', content: 'Contenido' },
    noExcerpt: { title: 'Un título', content: 'Contenido' },
    noContent: { title: 'Un título', excerpt: 'Un extracto' },
    invalidCategory: { title: 'Test', excerpt: 'Test', content: 'Test', category: 'invalida' },
    invalidStatus: { title: 'Test', excerpt: 'Test', content: 'Test', status: 'invalido' },
    tooLongTitle: { title: 'A'.repeat(201), excerpt: 'Test', content: 'Test' },
    tooLongExcerpt: { title: 'Test', excerpt: 'A'.repeat(301), content: 'Test' },
  },
  event: {
    noTitle: { description: 'Desc', startDate: new Date(), endDate: new Date() },
    noDescription: { title: 'Título', startDate: new Date(), endDate: new Date() },
    noStartDate: { title: 'Título', description: 'Desc', endDate: new Date() },
    noEndDate: { title: 'Título', description: 'Desc', startDate: new Date() },
    invalidCategory: { title: 'T', description: 'D', startDate: new Date(), endDate: new Date(), category: 'invalida' },
    invalidColor: { title: 'T', description: 'D', startDate: new Date(), endDate: new Date(), color: 'rojo' },
  },
};
