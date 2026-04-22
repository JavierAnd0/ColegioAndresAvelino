import Period from '../models/period.js';

// @route   GET /api/periods
// @access  Public
export const getAllPeriods = async (req, res) => {
    try {
        const periods = await Period.find().sort({ year: -1, createdAt: -1 });
        res.json({ success: true, count: periods.length, data: periods });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener los periodos' });
    }
};

// @route   GET /api/periods/active
// @access  Public
export const getActivePeriod = async (req, res) => {
    try {
        const period = await Period.findOne({ isActive: true });
        res.json({ success: true, data: period || null });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener el periodo activo' });
    }
};

// @route   POST /api/periods
// @access  Private (admin)
export const createPeriod = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const period = await Period.create(req.body);
        res.status(201).json({ success: true, data: period });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al crear el periodo' });
    }
};

// @route   PUT /api/periods/:id
// @access  Private (admin)
export const updatePeriod = async (req, res) => {
    try {
        const { name, year } = req.body;
        const period = await Period.findByIdAndUpdate(
            req.params.id,
            { $set: { name, year } },
            { new: true, runValidators: true }
        );
        if (!period) return res.status(404).json({ success: false, message: 'Periodo no encontrado' });
        res.json({ success: true, data: period });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar el periodo' });
    }
};

// @route   PATCH /api/periods/:id/activate
// @access  Private (admin)
export const activatePeriod = async (req, res) => {
    try {
        await Period.updateMany({}, { $set: { isActive: false } });
        const period = await Period.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: true } },
            { new: true }
        );
        if (!period) return res.status(404).json({ success: false, message: 'Periodo no encontrado' });
        res.json({ success: true, data: period });
    } catch {
        res.status(500).json({ success: false, message: 'Error al activar el periodo' });
    }
};

// @route   DELETE /api/periods/:id
// @access  Private (admin)
export const deletePeriod = async (req, res) => {
    try {
        const period = await Period.findByIdAndDelete(req.params.id);
        if (!period) return res.status(404).json({ success: false, message: 'Periodo no encontrado' });
        res.json({ success: true, message: 'Periodo eliminado exitosamente' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar el periodo' });
    }
};
