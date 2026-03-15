import express from 'express';
import {
    getTeachers,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';
import { uploadTeacherPhoto } from '../config/cloudinary.js';

const router = express.Router();

// Públicas
router.get('/', getTeachers);

// Admin
router.get('/admin', protect, authorize('admin'), getAllTeachers);
router.post('/', protect, authorize('admin'), uploadTeacherPhoto.single('photo'), createTeacher);
router.put('/:id', protect, authorize('admin'), validateObjectId, uploadTeacherPhoto.single('photo'), updateTeacher);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteTeacher);

export default router;
