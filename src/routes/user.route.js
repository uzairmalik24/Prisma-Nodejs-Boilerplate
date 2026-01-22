import express from "express";
const router = express.Router();

import userController from '../controllers/user.controller.js';


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh', userController.refreshToken);
router.post('/logout', userController.logout);
router.get('/me', userController.getCurrentUser);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getById);


export default router;