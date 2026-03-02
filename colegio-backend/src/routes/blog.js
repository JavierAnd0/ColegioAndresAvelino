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
} from '../controllers/blogController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { likeLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Rutas públicas
router.get('/', optionalAuth, getAllPosts);
router.get('/featured', getFeaturedPosts);
router.get('/recent', getRecentPosts);
router.get('/tags/all', getAllTags);
router.get('/category/:category', getPostsByCategory);
router.get('/tag/:tag', getPostsByTag);
router.post('/:id/like', likeLimiter, likePost);
router.get('/:identifier', optionalAuth, getPostByIdOrSlug);

// Rutas privadas
router.post('/', protect, authorize('admin', 'editor', 'author'), createPost);
router.put('/:id', protect, authorize('admin', 'editor', 'author'), updatePost);
router.delete('/:id', protect, authorize('admin', 'editor'), deletePost);

export default router;
