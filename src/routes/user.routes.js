import express from 'express';

import middleware from '../middlewares/middleware.js';
import userController from '../controllers/user.controller.js';
import FriendshipController from '../controllers/friendship.controller.js';
const router = express.Router();

// Get profile
router.get('/users/profile', middleware.validateToken, userController.getProfile);
router.put('/users/profile', middleware.validateToken, userController.updateProfile);
router.get('/users/search', middleware.validateToken, userController.searchUsersController); 

// Enviar una solicitud de amistad
router.post('/friends/request', middleware.validateToken, FriendshipController.sendFriendRequest);

// Aceptar una solicitud de amistad
router.post('/friends/request/:requestId/accept', middleware.validateToken, FriendshipController.acceptFriendRequest);

// Rechazar una solicitud de amistad
router.delete('/friends/request/:requestId/reject', middleware.validateToken, FriendshipController.rejectFriendRequest);

// Eliminar un amigo
router.delete('/friends/:friendId', middleware.validateToken, FriendshipController.removeFriend);

// Obtener la lista de amigos
router.get('/friends', middleware.validateToken, FriendshipController.getFriends);
export default router;
