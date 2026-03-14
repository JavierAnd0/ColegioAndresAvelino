import mongoose from 'mongoose';
import { ACTIVITY_TYPES } from './rssSource.js';

const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El título es obligatorio'],
            trim: true,
            maxlength: [200, 'El título no puede tener más de 200 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
            default: '',
        },
        type: {
            type: String,
            enum: {
                values: ACTIVITY_TYPES,
                message: '{VALUE} no es un tipo de actividad válido',
            },
            default: 'otro',
        },
        targetGrades: {
            type: [Number],
            default: [],
            validate: {
                validator: (arr) => arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 11),
                message: 'Los grados deben ser números enteros entre 0 y 11',
            },
        },
        content: {
            type: String,
            trim: true,
            maxlength: [5000, 'El contenido no puede tener más de 5000 caracteres'],
            default: '',
        },
        fileUrl: {
            type: String,
            trim: true,
            default: '',
        },
        externalUrl: {
            type: String,
            trim: true,
            default: '',
        },
        imageUrl: {
            type: String,
            default: '',
            trim: true,
        },
        source: {
            type: String,
            trim: true,
            default: '',
        },
        sourceType: {
            type: String,
            enum: {
                values: ['manual', 'rss'],
                message: '{VALUE} no es un tipo de fuente válido',
            },
            default: 'manual',
        },
        status: {
            type: String,
            enum: {
                values: ['draft', 'pending', 'approved', 'rejected'],
                message: '{VALUE} no es un estado válido',
            },
            default: 'approved',
        },
        rssSource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RssSource',
            default: null,
        },
        weekOf: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Índices
activitySchema.index({ externalUrl: 1 }, { unique: true, sparse: true });
activitySchema.index({ targetGrades: 1, type: 1 });
activitySchema.index({ weekOf: -1 });
activitySchema.index({ isActive: 1, status: 1 });

// Virtual: actividad nueva si weekOf es de esta semana
activitySchema.virtual('isNew').get(function () {
    if (!this.weekOf) return false;
    const now = new Date();
    const diffDays = (now - this.weekOf) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
});

// Pre-save: calcular weekOf si no está definido
activitySchema.pre('save', function (next) {
    if (!this.weekOf) {
        this.weekOf = getWeekMonday(new Date());
    }
    next();
});

// Helper: obtener el lunes de la semana ISO
function getWeekMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Estáticos
activitySchema.statics.getThisWeek = function (gradeFilter) {
    const monday = getWeekMonday(new Date());
    const filter = { weekOf: monday, isActive: true, status: 'approved' };
    if (gradeFilter !== undefined) {
        filter.targetGrades = parseInt(gradeFilter, 10);
    }
    return this.find(filter).sort({ type: 1, createdAt: -1 });
};

activitySchema.statics.getByGrade = function (gradeOrder) {
    return this.find({
        targetGrades: parseInt(gradeOrder, 10),
        isActive: true,
        status: 'approved',
    }).sort({ weekOf: -1, createdAt: -1 });
};

activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

export { getWeekMonday };
const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
