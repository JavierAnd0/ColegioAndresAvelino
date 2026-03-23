import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
    image: {
        url:      { type: String, required: true },
        publicId: { type: String, default: '' },
    },
    title:      { type: String, default: '', maxlength: 120 },
    subtitle:   { type: String, default: '', maxlength: 250 },
    linkUrl:    { type: String, default: '' },
    linkLabel:  { type: String, default: 'Ver más', maxlength: 40 },
    order:      { type: Number, default: 0 },
    active:     { type: Boolean, default: true },
}, { timestamps: true });

carouselSlideSchema.index({ active: 1, order: 1 });

export default mongoose.model('CarouselSlide', carouselSlideSchema);
