import { body, param, query, validationResult } from 'express-validator';

// Middleware que ejecuta las validaciones y retorna errores si los hay
export const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

// Validaciones para login
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  runValidation,
];

// Validaciones para registro
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'author']).withMessage('Rol no válido'),
  runValidation,
];

// Validaciones para actualizar perfil
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres')
    .escape(),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Ingresa un email válido')
    .normalizeEmail(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La biografía no puede tener más de 500 caracteres'),
  runValidation,
];

// Validaciones para cambiar contraseña
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  runValidation,
];

// Validación de MongoDB ObjectId en params
export const validateObjectId = [
  param('id')
    .isMongoId().withMessage('ID no válido'),
  runValidation,
];

// =============================================
// VALIDACIONES DE BLOG
// =============================================

// Categorías válidas del blog
const blogCategories = ['noticias', 'eventos', 'actividades', 'logros', 'anuncios', 'general'];
const blogStatuses = ['borrador', 'publicado', 'archivado'];

// Validaciones para crear un post
export const validateCreatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('El título no puede tener más de 200 caracteres'),
  body('excerpt')
    .trim()
    .notEmpty().withMessage('El extracto es obligatorio')
    .isLength({ max: 300 }).withMessage('El extracto no puede tener más de 300 caracteres'),
  body('content')
    .notEmpty().withMessage('El contenido es obligatorio'),
  body('category')
    .optional()
    .isIn(blogCategories).withMessage(`Categoría no válida. Debe ser: ${blogCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(blogStatuses).withMessage(`Estado no válido. Debe ser: ${blogStatuses.join(', ')}`),
  body('tags')
    .optional()
    .isArray().withMessage('Los tags deben ser un arreglo'),
  body('tags.*')
    .optional()
    .trim()
    .isString().withMessage('Cada tag debe ser texto')
    .isLength({ max: 50 }).withMessage('Cada tag no puede tener más de 50 caracteres'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured debe ser verdadero o falso'),
  body('seo.metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('El meta título no puede tener más de 60 caracteres'),
  body('seo.metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('La meta descripción no puede tener más de 160 caracteres'),
  runValidation,
];

// Validaciones para actualizar un post
export const validateUpdatePost = [
  param('id')
    .isMongoId().withMessage('ID de post no válido'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('El título no puede tener más de 200 caracteres'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('El extracto no puede tener más de 300 caracteres'),
  body('category')
    .optional()
    .isIn(blogCategories).withMessage(`Categoría no válida. Debe ser: ${blogCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(blogStatuses).withMessage(`Estado no válido. Debe ser: ${blogStatuses.join(', ')}`),
  body('tags')
    .optional()
    .isArray().withMessage('Los tags deben ser un arreglo'),
  body('tags.*')
    .optional()
    .trim()
    .isString().withMessage('Cada tag debe ser texto')
    .isLength({ max: 50 }).withMessage('Cada tag no puede tener más de 50 caracteres'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured debe ser verdadero o falso'),
  body('seo.metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('El meta título no puede tener más de 60 caracteres'),
  body('seo.metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('La meta descripción no puede tener más de 160 caracteres'),
  runValidation,
];

// Validación para categoría de blog en params
export const validateBlogCategory = [
  param('category')
    .isIn(blogCategories).withMessage(`Categoría no válida. Debe ser: ${blogCategories.join(', ')}`),
  runValidation,
];

// Validación para tag en params
export const validateBlogTag = [
  param('tag')
    .trim()
    .notEmpty().withMessage('El tag es obligatorio')
    .isLength({ max: 50 }).withMessage('El tag no puede tener más de 50 caracteres'),
  runValidation,
];

// Validación de query params para listar posts
export const validateBlogQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
  query('category')
    .optional()
    .isIn(blogCategories).withMessage(`Categoría no válida`),
  query('status')
    .optional()
    .isIn(blogStatuses).withMessage(`Estado no válido`),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La búsqueda no puede tener más de 200 caracteres'),
  runValidation,
];

// =============================================
// VALIDACIONES DE EVENTOS
// =============================================

// Categorías válidas de eventos
const eventCategories = ['academico', 'deportivo', 'cultural', 'reunion', 'festivo', 'otro'];

// Validaciones para crear un evento
export const validateCreateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título del evento es obligatorio')
    .isLength({ max: 100 }).withMessage('El título no puede tener más de 100 caracteres'),
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ max: 1000 }).withMessage('La descripción no puede tener más de 1000 caracteres'),
  body('startDate')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
  body('endDate')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La ubicación no puede tener más de 200 caracteres'),
  body('category')
    .optional()
    .isIn(eventCategories).withMessage(`Categoría no válida. Debe ser: ${eventCategories.join(', ')}`),
  body('isAllDay')
    .optional()
    .isBoolean().withMessage('isAllDay debe ser verdadero o falso'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('El color debe ser un código hexadecimal válido (ej: #3b82f6)'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic debe ser verdadero o falso'),
  body('participants')
    .optional()
    .isArray().withMessage('Los participantes deben ser un arreglo'),
  body('participants.*')
    .optional()
    .trim()
    .isString().withMessage('Cada participante debe ser texto'),
  runValidation,
];

// Validaciones para actualizar un evento
export const validateUpdateEvent = [
  param('id')
    .isMongoId().withMessage('ID de evento no válido'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El título no puede tener más de 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción no puede tener más de 1000 caracteres'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La ubicación no puede tener más de 200 caracteres'),
  body('category')
    .optional()
    .isIn(eventCategories).withMessage(`Categoría no válida. Debe ser: ${eventCategories.join(', ')}`),
  body('isAllDay')
    .optional()
    .isBoolean().withMessage('isAllDay debe ser verdadero o falso'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('El color debe ser un código hexadecimal válido'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic debe ser verdadero o falso'),
  body('participants')
    .optional()
    .isArray().withMessage('Los participantes deben ser un arreglo'),
  runValidation,
];

// Validación para categoría de evento en params
export const validateEventCategory = [
  param('category')
    .isIn(eventCategories).withMessage(`Categoría no válida. Debe ser: ${eventCategories.join(', ')}`),
  runValidation,
];

// Validación para mes/año en params
export const validateEventMonth = [
  param('year')
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número entre 2000 y 2100'),
  param('month')
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entre 1 y 12'),
  runValidation,
];

// Validación de query params para listar eventos
export const validateEventQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('El límite debe ser entre 1 y 500'),
  query('category')
    .optional()
    .isIn(eventCategories).withMessage('Categoría no válida'),
  query('isPublic')
    .optional()
    .isIn(['true', 'false']).withMessage('isPublic debe ser true o false'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate debe ser una fecha válida'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate debe ser una fecha válida'),
  runValidation,
];

// =============================================
// VALIDACIONES DE CUADRO DE HONOR
// =============================================

const honorCategories = ['academico', 'valores', 'reciclaje'];

export const validateCreateHonor = [
  body('grade')
    .notEmpty().withMessage('El grado es obligatorio')
    .isMongoId().withMessage('ID de grado no válido'),
  body('year')
    .notEmpty().withMessage('El año es obligatorio')
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe estar entre 2000 y 2100'),
  body('month')
    .notEmpty().withMessage('El mes es obligatorio')
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe estar entre 1 y 12'),
  body('category')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn(honorCategories).withMessage(`Categoría no válida. Debe ser: ${honorCategories.join(', ')}`),
  body('studentName')
    .trim()
    .notEmpty().withMessage('El nombre del estudiante es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede tener más de 100 caracteres'),
  body('photo.url')
    .optional({ values: 'falsy' })
    .isURL().withMessage('La URL de la foto debe ser válida'),
  body('photo.publicId')
    .optional({ values: 'falsy' })
    .isString().withMessage('El publicId debe ser texto'),
  runValidation,
];

export const validateUpdateHonor = [
  param('id')
    .isMongoId().withMessage('ID no válido'),
  body('grade')
    .optional()
    .isMongoId().withMessage('ID de grado no válido'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe estar entre 2000 y 2100'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe estar entre 1 y 12'),
  body('category')
    .optional()
    .isIn(honorCategories).withMessage(`Categoría no válida. Debe ser: ${honorCategories.join(', ')}`),
  body('studentName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede tener más de 100 caracteres'),
  body('photo.url')
    .optional({ values: 'falsy' })
    .isURL().withMessage('La URL de la foto debe ser válida'),
  body('photo.publicId')
    .optional({ values: 'falsy' })
    .isString().withMessage('El publicId debe ser texto'),
  runValidation,
];

export const validateHonorMonth = [
  param('year')
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número entre 2000 y 2100'),
  param('month')
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entre 1 y 12'),
  runValidation,
];

// =============================================
// VALIDACIONES DE GRADOS
// =============================================

export const validateCreateGrade = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del grado es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),
  body('order')
    .notEmpty().withMessage('El orden es obligatorio')
    .isInt({ min: 0 }).withMessage('El orden debe ser un número positivo'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser verdadero o falso'),
  runValidation,
];

export const validateUpdateGrade = [
  param('id')
    .isMongoId().withMessage('ID no válido'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número positivo'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser verdadero o falso'),
  runValidation,
];
