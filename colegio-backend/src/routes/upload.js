import express from 'express';
import {
    uploadBlogImage as uploadBlogImageController,
    uploadAvatar as uploadAvatarController,
    deleteImage,
} from '../controllers/uploadController.js';
import {
    uploadBlogImage,
    uploadAvatar,
} from '../config/cloudinary.js';
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

// Eliminar imagen
router.delete(
    '/:publicId',
    protect,
    authorize('admin'),
    deleteImage
);

export default router;