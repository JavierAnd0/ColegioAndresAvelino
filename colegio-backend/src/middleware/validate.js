import { body, param, validationResult } from 'express-validator';

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
