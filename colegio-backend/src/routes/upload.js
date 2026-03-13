import express from 'express';
import multer from 'multer';
import {
    uploadBlogImage as uploadBlogImageController,
    uploadAvatar as uploadAvatarController,
    deleteImage,
} from '../controllers/uploadController.js';
import {
    uploadBlogImage,
    uploadAvatar,
    uploadHonorImage,
} from '../config/cloudinary.js';
import { cloudinary } from '../config/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Subir imagen para blog (admin y editor)
router.post(
    '/blog',
    protect,
    authorize('admin', 'editor', 'author'),
    uploadBlogImage.single('image'),
    uploadBlogImageController
);

// Subir avatar
router.post(
    '/avatar',
    protect,
    uploadAvatar.single('image'),
    uploadAvatarController
);

// Subir foto para cuadro de honor
router.post(
    '/honor',
    protect,
    authorize('admin', 'editor'),
    uploadHonorImage.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen.' });
            }
            res.json({
                success: true,
                message: 'Foto subida exitosamente',
                data: { url: req.file.path, publicId: req.file.filename },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error al subir la foto' });
        }
    }
);

// Eliminar imagen
router.delete(
    '/:publicId',
    protect,
    authorize('admin'),
    deleteImage
);

export default router;
