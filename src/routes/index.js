import express from 'express';
const router = express.Router();

import userRoutes from './user.route.js';
import postRoutes from './post.route.js';
import savedPostsRoutes from './savedPosts.route.js';

router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/savedPosts', savedPostsRoutes);

export default router;