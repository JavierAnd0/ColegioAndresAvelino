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

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas privadas - perfil propio
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Rutas solo admin
router.post('/register', protect, authorize('admin'), register);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;