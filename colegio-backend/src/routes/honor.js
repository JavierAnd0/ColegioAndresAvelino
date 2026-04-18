import express from 'express';
import {
    getHonorBoard,
    getAvailableMonths,
    createHonorEntry,
    updateHonorEntry,
    deleteHonorEntry,
} from '../controllers/honorController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    validateCreateHonor,
    validateUpdateHonor,
    validateHonorMonth,
    validateObjectId,
} from '../middleware/validate.js';

const router = express.Router();

// Públicas
router.get('/board/:year/:month', validateHonorMonth, getHonorBoard);
router.get('/months', getAvailableMonths);

// Admin / Editor
router.post('/', protect, authorize('admin'), validateCreateHonor, createHonorEntry);
router.put('/:id', protect, authorize('admin'), validateUpdateHonor, updateHonorEntry);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteHonorEntry);

export default router;
