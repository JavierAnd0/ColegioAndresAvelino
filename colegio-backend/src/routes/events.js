import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    getEventsByCategory,
    getEventsByMonth,
} from '../controllers/eventController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas con autenticación opcional
router.get('/', optionalAuth, getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/month/:year/:month', getEventsByMonth);
router.get('/:id', getEventById);

// Rutas privadas (requieren autenticación)
router.post('/', protect, authorize('admin', 'editor'), createEvent);
router.put('/:id', protect, authorize('admin', 'editor'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'editor'), deleteEvent);

export default router;