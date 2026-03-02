import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    verifyToken,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import {
    validateLogin,
    validateRegister,
    validateUpdateProfile,
    validateChangePassword,
    validateObjectId,
} from '../middleware/validate.js';

const router = express.Router();

// Rutas públicas (login con rate limit + validación)
router.post('/login', loginLimiter, validateLogin, login);

// Rutas privadas - perfil propio
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

// Rutas solo admin
router.post('/register', protect, authorize('admin'), validateRegister, register);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), validateObjectId, getUserById);
router.put('/users/:id', protect, authorize('admin'), validateObjectId, updateUser);
router.delete('/users/:id', protect, authorize('admin'), validateObjectId, deleteUser);

export default router;
