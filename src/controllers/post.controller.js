import { Post,User, Comments, Favorite } from '../models/index.js';
import FriendShipServices from '../services/FriendShip.services.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';


const createPost = async (req, res) => {
    try {
        const { id } = req.user;
        const {title, caption, location, media } = req.body;

        const newPost = await Post.create({
            userId: id,
            title,
            caption,
            location,
            media,
            date: new Date()
        });

        sendSuccessResponse({ res, data: newPost, message: 'Post created successfully', statusCode: 201 });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to create post' });
    }
};

const getTimeline = async (req, res) => {
    try {
        const { id } = req.user;

        // Obtener los amigos o usuarios seguidos
        const friends = await FriendShipServices.getFriends(id);
        const followingIds = friends.map(friend => friend.followingId);

        // Incluir el propio userId para ver también los propios posts
        followingIds.push(id);

        // Obtener los posts de los usuarios seguidos, incluidos los detalles del usuario y comentarios
        const posts = await Post.findAll({
            where: {
                userId: followingIds
            },
            include: [
                {
                    model: User,
                    as: 'User',  // Alias para el usuario que creó el post
                    attributes: ['id', 'name', 'surname', 'profile_pic']
                },
                {
                    model: Comments,
                    as: 'Comments',  // Alias para los comentarios del post
                    include: [
                        {
                            model: User,
                            as: 'User',  // Alias para el usuario que hizo el comentario
                            attributes: ['id', 'name', 'surname', 'profile_pic']
                        }
                    ],
                    attributes: ['id', 'text', 'createdAt']
                }
            ],
            order: [['date', 'DESC']]  // Orden cronológico inverso (más reciente primero)
        });

        // Formatear la respuesta
        const response = posts.map(post => {
            return {
                id: post.id,
                user: {
                    id: post.user?.id,
                    name: post.user?.name,
                    surname: post.user?.surname,
                    profile_pic: post.user?.profile_pic
                },
                title: post.title,
                caption: post.caption,
                location: post.location,
                media: post.media,
                date: post.date,
                likesCount: post.likesCount,
                comments: post.Comments.map(comment => ({
                    id: comment.id,
                    comment: comment.text,
                    createdAt: comment.createdAt,
                    user: {
                        id: comment.User.id,
                        name: comment.User.name,
                        surname: comment.User.surname,
                        profile_pic: comment.User.profile_pic
                    }
                }))
            };
        });

        sendSuccessResponse({ res, data: response, message: 'Timeline retrieved successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to retrieve timeline' });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el post con el creador, comentarios, cantidad de likes y otros detalles
        const post = await Post.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    as: 'creator',  // Alias para el creador del post
                    attributes: ['id', 'username', 'profile_pic']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [
                        {
                            model: User,
                            as: 'commenter',  // Alias para el usuario que hizo el comentario
                            attributes: ['id', 'username', 'profile_pic']
                        }
                    ],
                    attributes: ['id', 'comment', 'createdAt']  // Atributos del comentario
                }
            ],
            attributes: [
                'id',
                'title',
                'caption',
                'location',
                'media',
                'likesCount',
                'date'
            ]
        });

        // Verificar si el post existe
        if (!post) {
            return sendErrorResponse({ res, message: 'Post not found', statusCode: 404 });
        }

        sendSuccessResponse({ res, data: post, message: 'Post retrieved successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to retrieve post' });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user; // Usuario autenticado

        // Buscar el post por su ID
        const post = await Post.findByPk(id);

        // Verificar si el post existe
        if (!post) {
            return sendErrorResponse({ res, message: 'Post not found', statusCode: 404 });
        }

        // Verificar si el usuario es el propietario del post
        if (post.userId !== userId) {
            return sendErrorResponse({ res, message: 'You do not have permission to delete this post', statusCode: 403 });
        }

        // Eliminar el post
        await post.destroy();

        sendSuccessResponse({ res, message: 'Post deleted successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to delete post' });
    }
};
const addComment = async (req, res) => {
    try {
        const { postId } = req.params; // ID del post al que se va a comentar
        const { comment } = req.body; // Texto del comentario
        const { userId } = req.user; // ID del usuario autenticado

        // Verificar que el post existe
        const post = await Post.findByPk(postId);
        if (!post) {
            return sendErrorResponse({ res, message: 'Post not found', statusCode: 404 });
        }

        // Crear el comentario
        const newComment = await Comment.create({
            postId,
            userId,
            comment,
            createdAt: new Date(),
        });

        sendSuccessResponse({ res, data: newComment, message: 'Comment added successfully', statusCode: 201 });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to add comment' });
    }
};
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params; // ID del comentario a eliminar
        const { userId } = req.user; // ID del usuario autenticado

        // Buscar el comentario por su ID
        const comment = await Comment.findByPk(commentId);

        // Verificar si el comentario existe
        if (!comment) {
            return sendErrorResponse({ res, message: 'Comment not found', statusCode: 404 });
        }

        // Verificar si el usuario es el propietario del comentario
        if (comment.userId !== userId) {
            return sendErrorResponse({ res, message: 'You do not have permission to delete this comment', statusCode: 403 });
        }

        // Eliminar el comentario
        await comment.destroy();

        sendSuccessResponse({ res, message: 'Comment deleted successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to delete comment' });
    }
};

const removePostAsFavorite = async (req, res) => {
    try {
        const { postId } = req.params;
        const { id } = req.user;

        const post = await Post.findByPk(id);

        if (!post) {
            throw new Error('Post not found');
        }
        const favoritePost = await Favorite.findOne({
            where: {
                userId: id,
                postId: postId
            }
        });

        if (favoritePost) {
            await Favorite.destroy({
                where: {
                    userId: id,
                    postId: postId
                }
            });
            sendSuccessResponse({ res, message: 'Post removed from favorites' });
        } else {
            await Favorite.create({
                userId: id,
                postId: postId
            });
            sendSuccessResponse({ res, message: 'Post added to favorites' });
        }
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to add post to favorites' });
    }
};

const getFavorites = async (req, res) => {
    try {
        const { id } = req.user;
        const favorites = await Favorite.findAll({
            where: {
                userId: id
            }
        });

        sendSuccessResponse({ res, data: favorites });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to get favorites' });
    }
};  

const addPostAsFavorite = async (req, res) => {
    try {
        const { postId } = req.params;
        const { id } = req.user;

        const post = await Post.findByPk(postId);

        if (!post) {
            return sendErrorResponse({res, error: 'Post not found', statusCode: 404})
        }

        const favoritePost = await Favorite.findOne({
            where: {
                userId: id,
                postId: postId
            }
        });

        if(favoritePost) {
            return sendErrorResponse({ res, message: 'Post already added to favorites', statusCode: 200 });
        }

        await Favorite.create({
            userId: id,
            postId: postId
        });
        sendSuccessResponse({ res, message: 'Post added to favorites' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to add post to favorites' });
    }
};  
export default {
    createPost,
    getTimeline,
    getPostById,
    deletePost,
    addComment,
    deleteComment,
    removePostAsFavorite,
    getFavorites,
    addPostAsFavorite,
    removePostAsFavorite
};