import mongoose from 'mongoose';

// Documento singleton — siempre se usa el mismo _id fijo
const heroSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'hero' },
    image: {
        url:      { type: String, default: '' },
        publicId: { type: String, default: '' },
    },
}, { timestamps: true });

export default mongoose.model('HeroSettings', heroSettingsSchema);
