import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadActivityFile } from '../config/cloudinary.js';
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
    approveActivity,
    rejectActivity,
    getPendingActivities,
    getRssSources,
    createRssSource,
    updateRssSource,
    deleteRssSource,
    triggerFetch,
    validateRssSource,
    bulkCreateActivities,
} from '../controllers/activityController.js';

const router = Router();

// ---- Rutas estáticas (ANTES de /:id) ----

// Público
router.get('/this-week', getThisWeekActivities);
router.get('/types', getActivityTypes);

// Admin — pendientes de aprobación
router.get('/pending', protect, authorize('admin'), getPendingActivities);

// Admin — fuentes RSS
router.get('/sources', protect, authorize('admin'), getRssSources);
router.post('/sources/validate', protect, authorize('admin'), validateRssSource);
router.post('/sources', protect, authorize('admin'), validateCreateRssSource, createRssSource);
router.put('/sources/:id', protect, authorize('admin'), validateUpdateRssSource, updateRssSource);
router.delete('/sources/:id', protect, authorize('admin'), validateObjectId, deleteRssSource);

// Admin — trigger manual de fetch
router.post('/fetch', protect, authorize('admin'), triggerFetch);

// Admin — carga masiva desde CSV (JSON array)
router.post('/bulk', protect, authorize('admin'), bulkCreateActivities);

// ---- Rutas con parámetros ----

// Público
router.get('/', validateActivityQuery, getActivities);
router.get('/:id', validateObjectId, getActivity);

// Admin — CRUD con soporte de file upload
router.post('/', protect, authorize('admin'), uploadActivityFile.single('file'), validateCreateActivity, createActivity);
router.put('/:id', protect, authorize('admin'), uploadActivityFile.single('file'), validateUpdateActivity, updateActivity);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteActivity);

// Admin — aprobar/rechazar
router.put('/:id/approve', protect, authorize('admin'), validateObjectId, approveActivity);
router.put('/:id/reject', protect, authorize('admin'), validateObjectId, rejectActivity);

export default router;
