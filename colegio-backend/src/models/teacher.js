import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del docente es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
        },
        cargo: {
            type: String,
            required: [true, 'El cargo es obligatorio'],
            trim: true,
            maxlength: [100, 'El cargo no puede tener más de 100 caracteres'],
        },
        jornada: {
            type: String,
            enum: {
                values: ['manana', 'tarde', 'ambas'],
                message: '{VALUE} no es una jornada válida',
            },
            default: 'manana',
        },
        photo: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
        },
        email: {
            type: String,
            trim: true,
            maxlength: [100, 'El email no puede tener más de 100 caracteres'],
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

teacherSchema.index({ jornada: 1, order: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
