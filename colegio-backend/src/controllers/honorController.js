import HonorEntry from '../models/honorEntry.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Obtener cuadro de honor de un mes
// @route   GET /api/honor/board/:year/:month
// @access  Public
export const getHonorBoard = async (req, res) => {
    try {
        const { year, month } = req.params;
        const entries = await HonorEntry.find({
            year: parseInt(year),
            month: parseInt(month),
        })
            .populate('grade', 'name order')
            .populate('createdBy', 'name')
            .sort({ 'grade.order': 1 });

        // Ordenar por grade.order después del populate
        entries.sort((a, b) => (a.grade?.order || 0) - (b.grade?.order || 0));

        res.json({
            success: true,
            count: entries.length,
            year: parseInt(year),
            month: parseInt(month),
            data: entries,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el cuadro de honor' });
    }
};

// @desc    Obtener meses disponibles con entries
// @route   GET /api/honor/months
// @access  Public
export const getAvailableMonths = async (req, res) => {
    try {
        const months = await HonorEntry.aggregate([
            { $group: { _id: { year: '$year', month: '$month' } } },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
        ]);

        res.json({
            success: true,
            data: months.map(m => ({ year: m._id.year, month: m._id.month })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los meses disponibles' });
    }
};

// @desc    Crear entrada en el cuadro de honor
// @route   POST /api/honor
// @access  Private (admin, editor)
export const createHonorEntry = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const entry = await HonorEntry.create(req.body);
        const populated = await entry.populate([
            { path: 'grade', select: 'name order' },
            { path: 'createdBy', select: 'name' },
        ]);

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrada para este grado, año, mes, categoría y jornada',
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al crear la entrada' });
    }
};

// @desc    Actualizar entrada del cuadro de honor
// @route   PUT /api/honor/:id
// @access  Private (admin, editor)
export const updateHonorEntry = async (req, res) => {
    try {
        const { grade, year, month, category, studentName, jornada, photo } = req.body;
        const entry = await HonorEntry.findByIdAndUpdate(req.params.id, { $set: { grade, year, month, category, studentName, jornada, photo } }, {
            new: true,
            runValidators: true,
        })
            .populate('grade', 'name order')
            .populate('createdBy', 'name');

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
        }

        res.json({ success: true, data: entry });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrada para este grado, año, mes, categoría y jornada',
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar la entrada' });
    }
};

// @desc    Eliminar entrada del cuadro de honor
// @route   DELETE /api/honor/:id
// @access  Private (admin, editor)
export const deleteHonorEntry = async (req, res) => {
    try {
        const entry = await HonorEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
        }

        // Borrar foto de Cloudinary si existe
        if (entry.photo?.publicId) {
            try {
                await cloudinary.uploader.destroy(entry.photo.publicId);
            } catch {
                // No bloquear eliminación si falla la foto
            }
        }

        await entry.deleteOne();
        res.json({ success: true, message: 'Entrada eliminada exitosamente' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar la entrada' });
    }
};
