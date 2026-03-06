import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del grado es obligatorio'],
            trim: true,
            unique: true,
            maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
        },
        order: {
            type: Number,
            required: [true, 'El orden del grado es obligatorio'],
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

gradeSchema.index({ order: 1 });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
