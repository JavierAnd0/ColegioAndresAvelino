import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del periodo es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
        },
        year: {
            type: Number,
            required: [true, 'El año es obligatorio'],
            min: [2000, 'El año debe ser posterior a 2000'],
            max: [2100, 'El año debe ser anterior a 2100'],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

periodSchema.index({ year: -1, createdAt: -1 });

const Period = mongoose.model('Period', periodSchema);
export default Period;
