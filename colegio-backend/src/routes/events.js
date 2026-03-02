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
import {
    validateObjectId,
    validateCreateEvent,
    validateUpdateEvent,
    validateEventCategory,
    validateEventMonth,
    validateEventQuery,
} from '../middleware/validate.js';

const router = express.Router();

// Rutas públicas con autenticación opcional
router.get('/', validateEventQuery, optionalAuth, getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/category/:category', validateEventCategory, getEventsByCategory);
router.get('/month/:year/:month', validateEventMonth, getEventsByMonth);
router.get('/:id', validateObjectId, getEventById);

// Rutas privadas (requieren autenticación)
router.post('/', protect, authorize('admin', 'editor'), validateCreateEvent, createEvent);
router.put('/:id', protect, authorize('admin', 'editor'), validateUpdateEvent, updateEvent);
router.delete('/:id', protect, authorize('admin', 'editor'), validateObjectId, deleteEvent);

export default router;
