import mongoose from 'mongoose';
import HonorEntry from '../models/honorEntry.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Obtener cuadro de honor de un periodo
// @route   GET /api/honor/board/:periodId
// @access  Public
export const getHonorBoard = async (req, res) => {
    try {
        const { periodId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(periodId)) {
            return res.status(400).json({ success: false, message: 'ID de periodo no válido' });
        }

        const entries = await HonorEntry.find({ period: periodId })
            .populate('grade', 'name order')
            .populate('period', 'name year')
            .populate('createdBy', 'name');

        entries.sort((a, b) => (a.grade?.order || 0) - (b.grade?.order || 0));

        res.json({
            success: true,
            count: entries.length,
            data: entries,
        });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener el cuadro de honor' });
    }
};

// @desc    Crear entrada en el cuadro de honor
// @route   POST /api/honor
// @access  Private (admin)
export const createHonorEntry = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const entry = await HonorEntry.create(req.body);
        const populated = await entry.populate([
            { path: 'grade', select: 'name order' },
            { path: 'period', select: 'name year' },
            { path: 'createdBy', select: 'name' },
        ]);

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrada para este grado, periodo, posición y jornada',
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
// @access  Private (admin)
export const updateHonorEntry = async (req, res) => {
    try {
        const { grade, period, position, studentName, jornada, photo } = req.body;
        const entry = await HonorEntry.findByIdAndUpdate(
            req.params.id,
            { $set: { grade, period, position, studentName, jornada, photo } },
            { new: true, runValidators: true }
        )
            .populate('grade', 'name order')
            .populate('period', 'name year')
            .populate('createdBy', 'name');

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
        }

        res.json({ success: true, data: entry });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrada para este grado, periodo, posición y jornada',
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
// @access  Private (admin)
export const deleteHonorEntry = async (req, res) => {
    try {
        const entry = await HonorEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
        }

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
