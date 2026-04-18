import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { ROLE_LEVEL } from '../middleware/auth.js';

// Función helper para generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  superadmin → puede crear admin y superadmin
//          admin      → solo puede crear admin
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const requestedRole = role || 'admin';

    // Solo superadmin puede crear cualquier usuario
    // Un admin NO puede crear otro admin ni superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo el superadmin puede crear nuevos usuarios.',
      });
    }

    // El superadmin no puede crear un rol superior al suyo (no aplica actualmente, pero es defensa)
    if ((ROLE_LEVEL[requestedRole] || 0) > (ROLE_LEVEL[req.user.role] || 0)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes crear un usuario con un rol superior al tuyo.',
      });
    }

    const userExists = await User.findByEmail(email);
    if (userExists) {
      // Un superadmin puede reemplazar una cuenta admin huérfana (ej: docente eliminado
      // cuyo User no fue borrado) siempre que no sea superadmin ni su propia cuenta.
      const canReplace =
        req.user.role === 'superadmin' &&
        userExists._id.toString() !== req.user.id &&
        (ROLE_LEVEL[userExists.role] || 0) < ROLE_LEVEL['superadmin'];

      if (!canReplace) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con ese email.',
        });
      }

      await User.findByIdAndDelete(userExists._id);
    }

    const user = await User.create({ name, email, password, role: requestedRole });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
    }
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario.' });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña',
      });
    }

    // Buscar usuario por email (incluyendo password para comparar)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.',
      });
    }

    // Verificar contraseña
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Generar token
    const token = generateToken(user._id);

    // Enviar respuesta
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
};

// @desc    Obtener usuario actual (perfil)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('postsCount')
      .populate('eventsCount');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
    });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Campos permitidos para actualizar
    const allowedFields = ['name', 'email', 'avatar', 'bio'];
    const updates = {};

    // Filtrar solo campos permitidos
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Verificar si el email ya existe (si se está cambiando)
    if (updates.email && updates.email !== req.user.email) {
      const emailExists = await User.findByEmail(updates.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Ese email ya está en uso',
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages,
      });
    }

    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Proporciona la contraseña actual y la nueva',
      });
    }

    // Obtener usuario con contraseña
    const user = await User.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Generar nuevo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      token,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages,
      });
    }

    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
    });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/auth/users
// @access  admin o superior (authorize en ruta)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios.',
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/auth/users/:id
// @access  admin o superior
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido.' });
    }
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario.' });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/auth/users/:id
// @access  Solo puede actualizar usuarios con nivel ESTRICTAMENTE inferior al propio
export const updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('-password');

    if (!target) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // No puede editar su propio perfil por esta ruta (usar /profile)
    if (target._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Usa /profile para editar tu propia información.' });
    }

    // Solo puede modificar usuarios con nivel inferior al suyo
    if ((ROLE_LEVEL[target.role] || 0) >= (ROLE_LEVEL[req.user.role] || 0)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes modificar a un usuario con el mismo nivel o superior al tuyo.',
      });
    }

    const allowedFields = ['name', 'email', 'isActive', 'avatar', 'bio'];
    // Solo superadmin puede cambiar roles
    if (req.user.role === 'superadmin') allowedFields.push('role');

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({ success: true, message: 'Usuario actualizado.', data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación.', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido.' });
    }
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario.' });
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/auth/users/:id
// @access  superadmin puede eliminar admins, admin no puede eliminar superadmins ni otros admins
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Solo se puede eliminar a alguien de nivel inferior
    if ((ROLE_LEVEL[target.role] || 0) >= (ROLE_LEVEL[req.user.role] || 0)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar a un usuario con el mismo nivel o superior al tuyo.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido.' });
    }
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario.' });
  }
};

// @desc    Admin resetea la contraseña de un usuario subordinado
// @route   PUT /api/auth/users/:id/reset-password
// @access  superadmin → puede resetear admins; admin → no puede resetear otros admins
export const adminResetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Usa "cambiar contraseña" para modificar tu propia contraseña.' });
    }

    if ((ROLE_LEVEL[target.role] || 0) >= (ROLE_LEVEL[req.user.role] || 0)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes resetear la contraseña de un usuario con el mismo nivel o superior al tuyo.',
      });
    }

    target.password = newPassword;
    await target.save();

    res.status(200).json({ success: true, message: `Contraseña de ${target.name} actualizada correctamente.` });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido.' });
    }
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al resetear contraseña.' });
  }
};

// @desc    Solicitar recuperación de contraseña (genera token)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'El email es obligatorio.' });
    }

    const user = await User.findByEmail(email);

    // Respuesta genérica para no revelar si el email existe
    const genericResponse = {
      success: true,
      message: 'Si el email existe en el sistema, recibirás el enlace de recuperación.',
    };

    if (!user || !user.isActive) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // En desarrollo retornamos el token para que el frontend lo envíe por EmailJS
    // En producción se configura un servidor SMTP
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;

    res.status(200).json({
      ...genericResponse,
      ...(process.env.NODE_ENV !== 'production' && {
        resetUrl,
        resetToken,
        userName: user.name,   // para personalizar el email en el frontend
      }),
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al procesar la solicitud.' });
  }
};

// @desc    Resetear contraseña con token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'El enlace de recuperación es inválido o ha expirado.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida correctamente.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ success: false, message: 'Error al resetear contraseña.' });
  }
};

// @desc    Verificar token (para mantener sesión)
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    // Si el middleware de autenticación pasó, el token es válido
    res.status(200).json({
      success: true,
      message: 'Token válido',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar token',
    });
  }
};