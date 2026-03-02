import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Proteger rutas privadas
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, message: 'No estás autenticado. Por favor inicia sesión.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'El usuario de este token ya no existe.' });
        }
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Tu cuenta está inactiva. Contacta al administrador.' });
        }
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({ success: false, message: 'Contraseña cambiada recientemente. Inicia sesión de nuevo.' });
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token inválido.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Tu sesión ha expirado. Inicia sesión de nuevo.' });
        }
        res.status(500).json({ success: false, message: 'Error al verificar autenticación.' });
    }
};

// Autenticación opcional (no bloquea si no hay token)
export const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) { req.user = null; return next(); }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Verificar roles específicos
// Uso: authorize('admin', 'editor')
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'No estás autenticado.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `El rol "${req.user.role}" no tiene permiso. Se requiere: ${roles.join(', ')}.`
            });
        }
        next();
    };
};