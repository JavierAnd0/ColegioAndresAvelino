import express from 'express';
import {
    getAllPosts,
    getPostByIdOrSlug,
    createPost,
    updatePost,
    deletePost,
    getFeaturedPosts,
    getRecentPosts,
    likePost,
    getPostsByCategory,
    getPostsByTag,
    getAllTags,
    suggestImages,
} from '../controllers/blogController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { likeLimiter } from '../middleware/rateLimit.js';
import {
    validateObjectId,
    validateCreatePost,
    validateUpdatePost,
    validateBlogCategory,
    validateBlogTag,
    validateBlogQuery,
} from '../middleware/validate.js';

const router = express.Router();

// Rutas privadas — antes de rutas dinámicas
router.get('/suggest-images', protect, authorize('admin', 'editor', 'author'), suggestImages);

// Rutas públicas
router.get('/', validateBlogQuery, optionalAuth, getAllPosts);
router.get('/featured', getFeaturedPosts);
router.get('/recent', getRecentPosts);
router.get('/tags/all', getAllTags);
router.get('/category/:category', validateBlogCategory, getPostsByCategory);
router.get('/tag/:tag', validateBlogTag, getPostsByTag);
router.post('/:id/like', validateObjectId, likeLimiter, likePost);
router.get('/:identifier', optionalAuth, getPostByIdOrSlug);

// Rutas privadas
router.post('/', protect, authorize('admin', 'editor', 'author'), validateCreatePost, createPost);
router.put('/:id', protect, authorize('admin', 'editor', 'author'), validateUpdatePost, updatePost);
router.delete('/:id', protect, authorize('admin', 'editor'), validateObjectId, deletePost);

export default router;
