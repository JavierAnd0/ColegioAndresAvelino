import Grade from '../models/grade.js';
import HonorEntry from '../models/honorEntry.js';

const DEFAULT_GRADES = [
    { name: 'Preescolar', order: 0 },
    { name: '1°', order: 1 },
    { name: '2°', order: 2 },
    { name: '3°', order: 3 },
    { name: '4°', order: 4 },
    { name: '5°', order: 5 },
];

// @desc    Obtener todos los grados activos
// @route   GET /api/grades
// @access  Public
export const getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find({ isActive: true }).sort({ order: 1 });
        res.json({ success: true, count: grades.length, data: grades });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los grados' });
    }
};

// @desc    Crear un grado
// @route   POST /api/grades
// @access  Private (admin)
export const createGrade = async (req, res) => {
    try {
        const grade = await Grade.create(req.body);
        res.status(201).json({ success: true, data: grade });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe un grado con ese nombre en esta jornada' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al crear el grado' });
    }
};

// @desc    Actualizar un grado
// @route   PUT /api/grades/:id
// @access  Private (admin)
export const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grado no encontrado' });
        }
        res.json({ success: true, data: grade });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe un grado con ese nombre en esta jornada' });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar el grado' });
    }
};

// @desc    Eliminar un grado
// @route   DELETE /api/grades/:id
// @access  Private (admin)
export const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grado no encontrado' });
        }

        // Verificar que no tenga entries vinculadas
        const entriesCount = await HonorEntry.countDocuments({ grade: req.params.id });
        if (entriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar: este grado tiene ${entriesCount} entrada(s) en el cuadro de honor`,
            });
        }

        await grade.deleteOne();
        res.json({ success: true, message: 'Grado eliminado exitosamente' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar el grado' });
    }
};

// @desc    Insertar grados por defecto (si la colección está vacía)
// @route   POST /api/grades/seed
// @access  Private (admin)
export const seedGrades = async (req, res) => {
    try {
        const count = await Grade.countDocuments();
        if (count > 0) {
            const grades = await Grade.find().sort({ order: 1 });
            return res.json({
                success: true,
                message: 'Ya existen grados configurados',
                data: grades,
            });
        }

        const grades = await Grade.insertMany(DEFAULT_GRADES);
        res.status(201).json({
            success: true,
            message: 'Grados por defecto creados exitosamente',
            data: grades,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al insertar los grados' });
    }
};
