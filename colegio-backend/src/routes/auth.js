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
    forgotPassword,
    resetPassword,
    adminResetPassword,
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

// Públicas
router.post('/login', loginLimiter, validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Perfil propio
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

// Gestión de usuarios (admin o superior)
router.post('/register', protect, authorize('admin'), validateRegister, register);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), validateObjectId, getUserById);
router.put('/users/:id', protect, authorize('admin'), validateObjectId, updateUser);
router.delete('/users/:id', protect, authorize('admin'), validateObjectId, deleteUser);
router.put('/users/:id/reset-password', protect, authorize('admin'), validateObjectId, adminResetPassword);

export default router;
