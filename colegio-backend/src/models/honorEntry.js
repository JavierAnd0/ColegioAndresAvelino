import mongoose from 'mongoose';

const honorEntrySchema = new mongoose.Schema(
    {
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade',
            required: [true, 'El grado es obligatorio'],
        },
        year: {
            type: Number,
            required: [true, 'El año es obligatorio'],
            min: [2000, 'El año debe ser posterior a 2000'],
            max: [2100, 'El año debe ser anterior a 2100'],
        },
        month: {
            type: Number,
            required: [true, 'El mes es obligatorio'],
            min: [1, 'El mes debe estar entre 1 y 12'],
            max: [12, 'El mes debe estar entre 1 y 12'],
        },
        category: {
            type: String,
            required: [true, 'La categoría es obligatoria'],
            enum: {
                values: ['academico', 'valores', 'reciclaje'],
                message: '{VALUE} no es una categoría válida',
            },
        },
        studentName: {
            type: String,
            required: [true, 'El nombre del estudiante es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
        },
        photo: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
        },
        jornada: {
            type: String,
            enum: {
                values: ['manana', 'tarde'],
                message: '{VALUE} no es una jornada válida',
            },
            default: 'manana',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// 1 estudiante por grado + mes + categoría + jornada
honorEntrySchema.index(
    { grade: 1, year: 1, month: 1, category: 1, jornada: 1 },
    { unique: true }
);

honorEntrySchema.index({ year: 1, month: 1 });

const HonorEntry = mongoose.model('HonorEntry', honorEntrySchema);
export default HonorEntry;
