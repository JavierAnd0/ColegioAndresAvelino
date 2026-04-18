import Teacher from '../models/teacher.js';
import User from '../models/user.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Obtener todos los docentes
// @route   GET /api/teachers
// @access  Public
export const getTeachers = async (req, res) => {
    try {
        const { jornada } = req.query;
        const filter = { isActive: true };
        if (jornada && ['manana', 'tarde', 'ambas'].includes(jornada)) {
            filter.$or = [{ jornada }, { jornada: 'ambas' }];
        }

        const teachers = await Teacher.find(filter).sort({ order: 1, name: 1 });
        res.json({ success: true, count: teachers.length, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los docentes' });
    }
};

// @desc    Obtener todos los docentes (admin - incluye inactivos)
// @route   GET /api/teachers/admin
// @access  Private (admin)
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ order: 1, name: 1 });
        res.json({ success: true, count: teachers.length, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los docentes' });
    }
};

// @desc    Crear docente
// @route   POST /api/teachers
// @access  Private (admin)
export const createTeacher = async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = {
                url: req.file.path,
                publicId: req.file.filename,
            };
        }

        const teacher = await Teacher.create(req.body);
        res.status(201).json({ success: true, data: teacher });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al crear el docente' });
    }
};

// @desc    Actualizar docente
// @route   PUT /api/teachers/:id
// @access  Private (admin)
export const updateTeacher = async (req, res) => {
    try {
        const { name, cargo, jornada, email, order, isActive } = req.body;
        const updateData = { name, cargo, jornada, email, order, isActive };

        if (req.file) {
            // Borrar foto anterior de Cloudinary
            const existing = await Teacher.findById(req.params.id);
            if (existing?.photo?.publicId) {
                try { await cloudinary.uploader.destroy(existing.photo.publicId); } catch {}
            }
            updateData.photo = { url: req.file.path, publicId: req.file.filename };
        }
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        res.json({ success: true, data: teacher });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar el docente' });
    }
};

// @desc    Eliminar docente
// @route   DELETE /api/teachers/:id
// @access  Private (admin)
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        if (teacher.photo?.publicId) {
            try { await cloudinary.uploader.destroy(teacher.photo.publicId); } catch {}
        }

        // Eliminar la cuenta de usuario vinculada por email (si existe)
        if (teacher.email) {
            await User.findOneAndDelete({ email: teacher.email.toLowerCase() });
        }

        await teacher.deleteOne();
        res.json({ success: true, message: 'Docente eliminado exitosamente' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar el docente' });
    }
};
