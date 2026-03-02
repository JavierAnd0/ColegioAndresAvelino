import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // No devolver la contraseña en las queries por defecto
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'editor', 'author'],
        message: '{VALUE} no es un rol válido',
      },
      default: 'author',
    },
    avatar: {
      type: String,
      default: '', // URL de la imagen de perfil
    },
    bio: {
      type: String,
      maxlength: [500, 'La biografía no puede tener más de 500 caracteres'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual para nombre completo (si tienes firstName y lastName)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual para contar posts del autor
userSchema.virtual('postsCount', {
  ref: 'BlogPost',
  localField: '_id',
  foreignField: 'author',
  count: true,
});

// Virtual para contar eventos creados
userSchema.virtual('eventsCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'createdBy',
  count: true,
});

// Asegurar que los virtuals se incluyan en JSON
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password; // Nunca devolver la contraseña en JSON
    return ret;
  }
});
userSchema.set('toObject', { virtuals: true });

// Middleware pre-save: Hashear contraseña
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Si la contraseña cambió (no es creación), actualizar passwordChangedAt
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Restar 1 seg para asegurar que el token JWT sea posterior
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pre-save: Convertir email a minúsculas
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Método de instancia: Comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Método de instancia: Verificar si la contraseña cambió después del token JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Método de instancia: Generar token de reseteo de contraseña
userSchema.methods.createPasswordResetToken = function() {
  // Generar token criptográficamente seguro
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hashear con SHA-256 y guardar en DB (más rápido que bcrypt para tokens de un solo uso)
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Expiración: 10 minutos
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Devolver token sin hashear (se enviará por email)
  return resetToken;
};

// Método de instancia: Actualizar último login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Método estático: Obtener usuarios activos
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true })
    .select('-password')
    .sort({ createdAt: -1 });
};

// Método estático: Obtener administradores
userSchema.statics.getAdmins = function() {
  return this.find({ role: 'admin', isActive: true })
    .select('-password')
    .sort({ name: 1 });
};

// Método estático: Buscar por email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

export default User;
