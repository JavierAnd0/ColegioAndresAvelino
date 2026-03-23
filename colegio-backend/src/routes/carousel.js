import express from 'express';
import {
    getSlides,
    getAllSlides,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
} from '../controllers/carouselController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Públicas
router.get('/', getSlides);

// Admin
router.get('/all', protect, authorize('admin'), getAllSlides);
router.post('/', protect, authorize('admin'), createSlide);
router.put('/reorder', protect, authorize('admin'), reorderSlides);
router.put('/:id', protect, authorize('admin'), updateSlide);
router.delete('/:id', protect, authorize('admin'), deleteSlide);

export default router;
