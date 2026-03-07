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

// Subir foto para cuadro de honor (upload directo a Cloudinary sin plugin)
const honorUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false);
        }
    },
});

router.post(
    '/honor',
    protect,
    authorize('admin', 'editor'),
    honorUpload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen.' });
            }

            // Subir buffer directamente a Cloudinary
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'colegio/honor',
                        transformation: [
                            { width: 400, height: 400, crop: 'fill', quality: 'auto' }
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            res.json({
                success: true,
                message: 'Foto subida exitosamente',
                data: { url: result.secure_url, publicId: result.public_id },
            });
        } catch (error) {
            console.error('Error uploading honor photo:', error.message);
            res.status(500).json({ success: false, message: 'Error al subir la foto. Verifica la configuración de Cloudinary.' });
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
