import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

// Secret para tests (debe coincidir con lo que usa el middleware)
const TEST_JWT_SECRET = 'test-jwt-secret-for-testing-only';

/**
 * Crear un usuario de prueba y devolver el token JWT
 * @param {Object} overrides - Campos para sobreescribir los defaults
 * @returns {{ user: Object, token: string }}
 */
export async function createTestUser(overrides = {}) {
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'author',
    isActive: true,
    ...overrides,
  };

  const user = await User.create(userData);
  const token = generateToken(user._id);

  return { user, token };
}

/**
 * Crear un usuario admin de prueba
 * @returns {{ user: Object, token: string }}
 */
export async function createAdminUser() {
  return createTestUser({
    name: 'Admin User',
    email: `admin-${Date.now()}@example.com`,
    role: 'admin',
  });
}

/**
 * Crear un usuario editor de prueba
 * @returns {{ user: Object, token: string }}
 */
export async function createEditorUser() {
  return createTestUser({
    name: 'Editor User',
    email: `editor-${Date.now()}@example.com`,
    role: 'editor',
  });
}

/**
 * Generar un token JWT para un ID de usuario
 * @param {string} userId
 * @returns {string}
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Generar un token JWT expirado
 * @param {string} userId
 * @returns {string}
 */
export function generateExpiredToken(userId) {
  return jwt.sign({ id: userId }, TEST_JWT_SECRET, { expiresIn: '0s' });
}
