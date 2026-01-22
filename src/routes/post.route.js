import express from 'express';
import postController from '../controllers/post.controller.js';

const router = express.Router();

router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/posts/user/:userId', postController.getPostsByUserId);

router.post('/posts', postController.createPost);
router.put('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deletePost);
router.get('/my-posts', postController.getMyPosts);
router.get('/my-posts/stats', postController.getMyPostStats);

export default router;