import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    validateObjectId,
    validateActivityQuery,
    validateCreateActivity,
    validateUpdateActivity,
    validateCreateRssSource,
    validateUpdateRssSource,
} from '../middleware/validate.js';
import {
    getActivities,
    getThisWeekActivities,
    getActivityTypes,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    getRssSources,
    createRssSource,
    updateRssSource,
    deleteRssSource,
    triggerFetch,
} from '../controllers/activityController.js';

const router = Router();

// ---- Rutas estáticas (ANTES de /:id) ----

// Público
router.get('/this-week', getThisWeekActivities);
router.get('/types', getActivityTypes);

// Admin — fuentes RSS
router.get('/sources', protect, authorize('admin'), getRssSources);
router.post('/sources', protect, authorize('admin'), validateCreateRssSource, createRssSource);
router.put('/sources/:id', protect, authorize('admin'), validateUpdateRssSource, updateRssSource);
router.delete('/sources/:id', protect, authorize('admin'), validateObjectId, deleteRssSource);

// Admin — trigger manual de fetch
router.post('/fetch', protect, authorize('admin'), triggerFetch);

// ---- Rutas con parámetros ----

// Público
router.get('/', validateActivityQuery, getActivities);
router.get('/:id', validateObjectId, getActivity);

// Admin
router.post('/', protect, authorize('admin'), validateCreateActivity, createActivity);
router.put('/:id', protect, authorize('admin'), validateUpdateActivity, updateActivity);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteActivity);

export default router;
