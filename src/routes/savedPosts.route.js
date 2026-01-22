import express from 'express';
import savedPostController from '../controllers/savedPosts.controller.js';

const router = express.Router();

router.post('/', savedPostController.savePost);
router.get('/user/:userId', savedPostController.getSavedPostsByUser);
router.get('/my-posts', savedPostController.getMySavedPosts);
router.delete('/:id', savedPostController.removeSavedPost);

export default router;