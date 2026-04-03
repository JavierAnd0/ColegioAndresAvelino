import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
    image: {
        url:      { type: String, required: true },
        publicId: { type: String, default: '' },
    },
    title:    { type: String, default: '', maxlength: 120 },
    subtitle: { type: String, default: '', maxlength: 250 },
    order:    { type: Number, default: 0 },
    active:   { type: Boolean, default: true },
}, { timestamps: true });

heroSlideSchema.index({ active: 1, order: 1 });

export default mongoose.model('HeroSlide', heroSlideSchema);
