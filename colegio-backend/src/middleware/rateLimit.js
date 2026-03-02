import rateLimit from 'express-rate-limit';

// Rate limiter para login - previene ataques de fuerza bruta
// 10 intentos por IP cada 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter general para API - 100 requests por minuto por IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta de nuevo en un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para likes - 30 likes por minuto por IP
export const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Demasiadas reacciones. Intenta de nuevo en un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
