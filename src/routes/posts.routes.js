import express from 'express';
import PostController from '../controllers/post.controller.js';
import middleware from '../middlewares/middleware.js';

const router = express.Router();

//feed instagram
router.get('/timeline', middleware.validateToken, PostController.getTimeline);

router.post('/posts', middleware.validateToken, PostController.createPost);
router.get('/posts/:id', middleware.validateToken, PostController.getPostById);
router.delete('/posts/:id', middleware.validateToken, PostController.deletePost);

// Añadir un comentario a un post específico
router.post('/posts/:postId/comments', middleware.validateToken, PostController.addComment);

// Eliminar un comentario por su ID
router.delete('/comments/:commentId', middleware.validateToken, PostController.deleteComment);

router.post('/posts/:postId/favorites', middleware.validateToken,PostController.addPostAsFavorite)
router.get('/favorites', middleware.validateToken,PostController.getFavorites)
router.delete('/favorites/:postId',middleware.validateToken, PostController.removePostAsFavorite)

router.put('/posts/:postId/likes', middleware.validateToken, PostController.updateLike);
export default router;
