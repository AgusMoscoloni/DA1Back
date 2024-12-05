import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import middleware from '../middlewares/middleware.js';
import UserController from '../controllers/user.controller.js';
import { uploadImage } from '../controllers/utils.controller.js';
const router = express.Router();

// Registro de usuarios
router.post('/register', AuthController.SignUp);

// Inicio de sesión
router.post('/login', AuthController.Login);
router.post('/login-with-google', AuthController.loginWithGoogle);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh-token',middleware.validateRefreshToken, AuthController.refreshToken);
router.post('/delete-account',middleware.validateToken, UserController.deleteAccount);
router.post('/upload', middleware.validateToken, uploadImage)
export default router;
