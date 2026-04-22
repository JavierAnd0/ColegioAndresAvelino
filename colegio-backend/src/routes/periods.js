import express from 'express';
import {
    getAllPeriods,
    getActivePeriod,
    createPeriod,
    updatePeriod,
    activatePeriod,
    deletePeriod,
} from '../controllers/periodController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// Públicas
router.get('/', getAllPeriods);
router.get('/active', getActivePeriod);

// Admin
router.post('/', protect, authorize('admin'), createPeriod);
router.put('/:id', protect, authorize('admin'), validateObjectId, updatePeriod);
router.patch('/:id/activate', protect, authorize('admin'), validateObjectId, activatePeriod);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deletePeriod);

export default router;
