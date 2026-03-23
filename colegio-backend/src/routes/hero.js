import express from 'express';
import HeroSettings from '../models/heroSettings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/hero — público
router.get('/', async (req, res) => {
    try {
        const doc = await HeroSettings.findById('hero');
        res.json({ success: true, data: doc || { image: { url: '', publicId: '' } } });
    } catch {
        res.status(500).json({ success: false, message: 'Error al obtener la imagen del hero' });
    }
});

// PUT /api/hero — admin
router.put('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { image } = req.body;
        const doc = await HeroSettings.findByIdAndUpdate(
            'hero',
            { image },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, data: doc });
    } catch {
        res.status(500).json({ success: false, message: 'Error al actualizar la imagen del hero' });
    }
});

export default router;
