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

// Configurar storage para fotos del cuadro de honor
const honorStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'colegio/honor',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }
        ],
    },
});

// Configurar storage para actividades (PDFs e imágenes)
const activityStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'colegio/actividades',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
        resource_type: 'auto',
    },
});

const activityFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, png, webp) y PDFs'), false);
    }
};

// Configurar storage para fotos de docentes
const teacherStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'colegio/docentes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }
        ],
    },
});

// Exportar middlewares de multer
export const uploadBlogImage = multer({ storage: blogStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
export const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
export const uploadHonorImage = multer({ storage: honorStorage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } }); // 3MB
export const uploadActivityFile = multer({ storage: activityStorage, fileFilter: activityFileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
export const uploadTeacherPhoto = multer({ storage: teacherStorage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } }); // 3MB
export { cloudinary };