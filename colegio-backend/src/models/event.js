import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede tener más de 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción del evento es obligatoria'],
      trim: true,
      maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria'],
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      },
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'La ubicación no puede tener más de 200 caracteres'],
    },
    category: {
      type: String,
      enum: {
        values: ['academico', 'deportivo', 'cultural', 'reunion', 'festivo', 'otro'],
        message: '{VALUE} no es una categoría válida',
      },
      default: 'otro',
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3b82f6', // Color azul por defecto
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido'],
    },
    participants: [{
      type: String,
      trim: true,
    }],
    isPublic: {
      type: Boolean,
      default: true, // Los eventos son públicos por defecto
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices para mejorar el rendimiento de búsquedas
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isPublic: 1 });

// Método virtual para verificar si el evento ya pasó
eventSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

// Método virtual para verificar si el evento está activo
eventSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Asegurar que los virtuals se incluyan en JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Middleware pre-save para validaciones adicionales
eventSchema.pre('save', function(next) {
  // Asegurar que startDate es antes que endDate
  if (this.startDate > this.endDate) {
    return next(new Error('La fecha de inicio debe ser anterior a la fecha de fin'));
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;