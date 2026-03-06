import express from 'express';
import {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    seedGrades,
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCreateGrade, validateUpdateGrade, validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// Públicas
router.get('/', getAllGrades);

// Admin only
router.post('/', protect, authorize('admin'), validateCreateGrade, createGrade);
router.post('/seed', protect, authorize('admin'), seedGrades);
router.put('/:id', protect, authorize('admin'), validateUpdateGrade, updateGrade);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteGrade);

export default router;
