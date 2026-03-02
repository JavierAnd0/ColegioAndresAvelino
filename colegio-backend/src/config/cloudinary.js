import { v2 as cloudinary } from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;
import multer from 'multer';

// Configurar Cloudinary con las credenciales
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar storage para posts del blog
const blogStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'colegio/blog',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 630, crop: 'fill', quality: 'auto' }
        ],
    },
});

// Configurar storage para avatares
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'colegio/avatares',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 200, height: 200, crop: 'fill', quality: 'auto' }
        ],
    },
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false);
    }
};

// Exportar middlewares de multer
export const uploadBlogImage = multer({ storage: blogStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
export const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
export { cloudinary };