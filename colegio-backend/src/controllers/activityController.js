import * as Sentry from '@sentry/node';
import Activity, { getWeekMonday } from '../models/activity.js';
import RssSource, { ACTIVITY_TYPES } from '../models/rssSource.js';
import { fetchAllSources, validateFeedUrl } from '../services/rssFetcher.js';

/**
 * Normaliza targetGrades desde req.body (multer devuelve string si hay 1 solo valor).
 */
function parseTargetGrades(raw) {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map(Number).filter((n) => !isNaN(n) && Number.isInteger(n));
}

// =============================================
// ACTIVIDADES — Endpoints públicos
// =============================================

/** GET /api/activities */
export const getActivities = async (req, res) => {
    try {
        const { grade, type, search, week, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true, status: 'approved' };

        if (grade !== undefined) filter.targetGrades = parseInt(grade, 10);
        if (type && ACTIVITY_TYPES.includes(type)) filter.type = type;
        if (week) filter.weekOf = new Date(week);
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            filter.$or = [{ title: regex }, { description: regex }];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const [data, total] = await Promise.all([
            Activity.find(filter).sort({ weekOf: -1, createdAt: -1 }).skip(skip).limit(limitNum),
            Activity.countDocuments(filter),
        ]);

        res.json({
            success: true,
            count: data.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data,
        });
    } catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** GET /api/activities/this-week */
export const getThisWeekActivities = async (req, res) => {
    try {
        const { grade } = req.query;
        const monday = getWeekMonday(new Date());
        const filter = { weekOf: monday, isActive: true, status: 'approved' };

        if (grade !== undefined) filter.targetGrades = parseInt(grade, 10);

        const data = await Activity.find(filter).sort({ type: 1, createdAt: -1 });

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** GET /api/activities/types */
export const getActivityTypes = async (req, res) => {
    res.json({ success: true, data: ACTIVITY_TYPES });
};

/** GET /api/activities/:id */
export const getActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
        }
        res.json({ success: true, data: activity });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// =============================================
// ACTIVIDADES — Endpoints admin
// =============================================

/** POST /api/activities */
export const createActivity = async (req, res) => {
    try {
        const { title, description, content, type, externalUrl, imageUrl } = req.body;

        const activityData = {
            title,
            description,
            content,
            type,
            targetGrades: parseTargetGrades(req.body.targetGrades || req.body['targetGrades[]']),
            externalUrl: externalUrl || undefined,
            imageUrl,
            source: 'Manual',
            sourceType: 'manual',
            status: 'approved',
            weekOf: getWeekMonday(new Date()),
        };

        // Si se subió un archivo (PDF o imagen)
        if (req.file) {
            activityData.fileUrl = req.file.path;
        }

        const activity = await Activity.create(activityData);
        res.status(201).json({ success: true, data: activity });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe una actividad con esa URL' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
        }
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** PUT /api/activities/:id */
export const updateActivity = async (req, res) => {
    try {
        const { title, description, content, type, externalUrl, imageUrl, status, isActive, isFeatured, weekOf } = req.body;
        const updateData = { title, description, content, type, externalUrl, imageUrl, status, isActive, isFeatured, weekOf };
        updateData.targetGrades = parseTargetGrades(req.body.targetGrades || req.body['targetGrades[]']);

        // Si se subió un archivo nuevo
        if (req.file) {
            updateData.fileUrl = req.file.path;
        }

        const activity = await Activity.findByIdAndUpdate(req.params.id, { $set: updateData }, {
            new: true,
            runValidators: true,
        });
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
        }
        res.json({ success: true, data: activity });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** DELETE /api/activities/:id */
export const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
        }
        res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** PUT /api/activities/:id/approve */
export const approveActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
        }
        res.json({ success: true, data: activity });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** PUT /api/activities/:id/reject */
export const rejectActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
        }
        res.json({ success: true, data: activity });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** GET /api/activities/pending */
export const getPendingActivities = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const filter = { status: 'pending' };

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const [data, total] = await Promise.all([
            Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Activity.countDocuments(filter),
        ]);

        res.json({
            success: true,
            count: data.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// =============================================
// FUENTES RSS — CRUD admin
// =============================================

/** GET /api/activities/sources */
export const getRssSources = async (req, res) => {
    try {
        const sources = await RssSource.find().sort({ createdAt: -1 });
        res.json({ success: true, count: sources.length, data: sources });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** POST /api/activities/sources */
export const createRssSource = async (req, res) => {
    try {
        const source = await RssSource.create(req.body);
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe una fuente con esa URL' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** PUT /api/activities/sources/:id */
export const updateRssSource = async (req, res) => {
    try {
        const { name, url, defaultType, defaultGrades, isActive } = req.body;
        const source = await RssSource.findByIdAndUpdate(req.params.id, { $set: { name, url, defaultType, defaultGrades, isActive } }, {
            new: true,
            runValidators: true,
        });
        if (!source) {
            return res.status(404).json({ success: false, message: 'Fuente no encontrada' });
        }
        res.json({ success: true, data: source });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** DELETE /api/activities/sources/:id */
export const deleteRssSource = async (req, res) => {
    try {
        const source = await RssSource.findByIdAndDelete(req.params.id);
        if (!source) {
            return res.status(404).json({ success: false, message: 'Fuente no encontrada' });
        }
        res.json({ success: true, message: 'Fuente eliminada' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/** POST /api/activities/fetch — trigger manual */
export const triggerFetch = async (req, res) => {
    try {
        const result = await fetchAllSources();
        res.json({ success: true, data: result });
    } catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: 'Error al obtener actividades de RSS' });
    }
};

/** POST /api/activities/bulk — crea múltiples actividades desde un array JSON */
export const bulkCreateActivities = async (req, res) => {
    const { activities } = req.body;
    if (!Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array de actividades' });
    }

    const monday = getWeekMonday(new Date());
    let created = 0;
    const errors = [];

    for (let i = 0; i < activities.length; i++) {
        const act = activities[i];
        try {
            const rawGrades = act.targetGrades;
            const targetGrades = Array.isArray(rawGrades)
                ? rawGrades.map(Number).filter((n) => !isNaN(n))
                : [];

            await Activity.create({
                title: String(act.title || '').trim(),
                description: String(act.description || '').trim(),
                type: act.type || 'otro',
                targetGrades,
                externalUrl: act.externalUrl || undefined,
                source: 'Manual',
                sourceType: 'manual',
                status: 'approved',
                weekOf: monday,
                isActive: true,
            });
            created++;
        } catch (err) {
            errors.push(`Fila ${i + 1} ("${act.title || ''}"): ${err.message}`);
        }
    }

    res.status(201).json({ success: true, data: { created, errors } });
};

/** POST /api/activities/sources/validate — valida una URL de feed RSS sin guardarla */
export const validateRssSource = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ success: false, message: 'La URL es obligatoria' });
    }
    try {
        const result = await validateFeedUrl(url);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al validar el feed' });
    }
};
