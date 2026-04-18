import HeroSlide from '../models/heroSlide.js';

// GET /api/hero-slides  — público, solo slides activos
export const getSlides = async (req, res) => {
    try {
        const slides = await HeroSlide.find({ active: true }).sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: slides });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener slides del hero' });
    }
};

// GET /api/hero-slides/all  — admin, todos los slides
export const getAllSlides = async (req, res) => {
    try {
        const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: slides });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener slides del hero' });
    }
};

// POST /api/hero-slides  — admin
export const createSlide = async (req, res) => {
    try {
        const count = await HeroSlide.countDocuments();
        const slide = await HeroSlide.create({ ...req.body, order: count });
        res.status(201).json({ success: true, data: slide });
    } catch {
        res.status(500).json({ success: false, message: 'Error al crear slide del hero' });
    }
};

// PUT /api/hero-slides/reorder  — admin
export const reorderSlides = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'ids debe ser un array' });
        }
        await Promise.all(ids.map((id, index) =>
            HeroSlide.findByIdAndUpdate(id, { order: index })
        ));
        res.json({ success: true, message: 'Orden actualizado' });
    } catch {
        res.status(500).json({ success: false, message: 'Error al reordenar slides del hero' });
    }
};

// PUT /api/hero-slides/:id  — admin
export const updateSlide = async (req, res) => {
    try {
        const { image, title, subtitle, order, active } = req.body;
        const slide = await HeroSlide.findByIdAndUpdate(
            req.params.id,
            { image, title, subtitle, order, active },
            { new: true, runValidators: true }
        );
        if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
        res.json({ success: true, data: slide });
    } catch {
        res.status(500).json({ success: false, message: 'Error al actualizar slide del hero' });
    }
};

// DELETE /api/hero-slides/:id  — admin
export const deleteSlide = async (req, res) => {
    try {
        const slide = await HeroSlide.findByIdAndDelete(req.params.id);
        if (!slide) return res.status(404).json({ success: false, message: 'Slide no encontrado' });
        res.json({ success: true, message: 'Slide eliminado' });
    } catch {
        res.status(500).json({ success: false, message: 'Error al eliminar slide del hero' });
    }
};
