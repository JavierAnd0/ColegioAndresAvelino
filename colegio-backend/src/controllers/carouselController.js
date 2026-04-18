import CarouselSlide from '../models/carousel.js';

// GET /api/carousel  — público, solo slides activos
export const getSlides = async (req, res) => {
    try {
        const slides = await CarouselSlide.find({ active: true }).sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: slides });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener slides' });
    }
};

// GET /api/carousel/all  — admin, todos los slides
export const getAllSlides = async (req, res) => {
    try {
        const slides = await CarouselSlide.find().sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: slides });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener slides' });
    }
};

// POST /api/carousel  — admin
export const createSlide = async (req, res) => {
    try {
        const { image, title, subtitle, linkUrl, linkLabel, active } = req.body;
        const count = await CarouselSlide.countDocuments();
        const slide = await CarouselSlide.create({ image, title, subtitle, linkUrl, linkLabel, active, order: count });
        res.status(201).json({ success: true, data: slide });
    } catch {
        res.status(500).json({ success: false, message: 'Error al crear slide' });
    }
};

// PUT /api/carousel/reorder  — admin
export const reorderSlides = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'ids debe ser un array' });
        }
        await Promise.all(ids.map((id, index) =>
            CarouselSlide.findByIdAndUpdate(id, { order: index })
        ));
        res.json({ success: true, message: 'Orden actualizado' });
    } catch {
        res.status(500).json({ success: false, message: 'Error al reordenar slides' });
    }
};

// PUT /api/carousel/:id  — admin
export const updateSlide = async (req, res) => {
    try {
        const { image, title, subtitle, linkUrl, linkLabel, order, active } = req.body;
        const slide = await CarouselSlide.findByIdAndUpdate(
            req.params.id,
            { $set: { image, title, subtitle, linkUrl, linkLabel, order, active } },
            { new: true, runValidators: true }
        );
        if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
        res.json({ success: true, data: slide });
    } catch {
        res.status(500).json({ success: false, message: 'Error al actualizar slide' });
    }
};

// DELETE /api/carousel/:id  — admin
export const deleteSlide = async (req, res) => {
    try {
        const slide = await CarouselSlide.findByIdAndDelete(req.params.id);
        if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
        res.json({ success: true, message: 'Slide eliminado' });
    } catch {
        res.status(500).json({ success: false, message: 'Error al eliminar slide' });
    }
};
