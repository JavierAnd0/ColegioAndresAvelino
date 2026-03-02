import { cloudinary } from '../config/cloudinary.js';

// @desc    Subir imagen para blog
// @route   POST /api/upload/blog
// @access  Private
export const uploadBlogImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Imagen subida exitosamente',
            data: {
                url: req.file.path,
                publicId: req.file.filename,
                width: req.file.width,
                height: req.file.height,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message,
        });
    }
};

// @desc    Subir avatar de usuario
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Avatar subido exitosamente',
            data: {
                url: req.file.path,
                publicId: req.file.filename,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al subir el avatar',
            error: error.message,
        });
    }
};

// @desc    Eliminar imagen de Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;

        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            success: true,
            message: 'Imagen eliminada exitosamente',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen',
            error: error.message,
        });
    }
};