import mongoose from 'mongoose';

const honorEntrySchema = new mongoose.Schema(
    {
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade',
            required: [true, 'El grado es obligatorio'],
        },
        period: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Period',
            required: [true, 'El periodo es obligatorio'],
        },
        position: {
            type: Number,
            required: [true, 'La posición es obligatoria'],
            enum: {
                values: [1, 2, 3],
                message: 'La posición debe ser 1, 2 o 3',
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

// 1 estudiante por grado + periodo + posición + jornada
honorEntrySchema.index(
    { grade: 1, period: 1, position: 1, jornada: 1 },
    { unique: true }
);

honorEntrySchema.index({ period: 1 });

const HonorEntry = mongoose.model('HonorEntry', honorEntrySchema);
export default HonorEntry;
