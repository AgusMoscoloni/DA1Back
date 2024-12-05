import { User, Friendship } from '../models/index.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';

// Enviar solicitud de amistad
const sendFriendRequest = async (req, res) => {
    try {
        const { id } = req.user;
        const { friendId } = req.body;

        if (id === friendId) {
            return sendErrorResponse({ res, message: "You cannot send a friend request to yourself", statusCode: 400 });
        }

        // Verificar si la solicitud ya existe
        const existingRequest = await Friendship.findOne({
            where: {
                followerId: id,
                followingId: friendId,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return sendErrorResponse({ res, message: "Friend request already sent", statusCode: 400 });
        }

        // Crear la solicitud de amistad
        const newRequest = await Friendship.create({
            followerId: id,
            followingId: friendId,
            status: 'accepted',
        });
        
        sendSuccessResponse({ res, data: newRequest, message: 'Friend request sent successfully', statusCode: 201 });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to send friend request' });
    }
};

// Aceptar solicitud de amistad
const acceptFriendRequest = async (req, res) => {
    try {
        const { id } = req.user;
        const { requestId } = req.params;

        // Buscar la solicitud de amistad
        const friendRequest = await Friendship.findOne({
            where: {
                id: requestId,
                followingId: id,
                status: 'pending'
            }
        });

        if (!friendRequest) {
            return sendErrorResponse({ res, message: 'Friend request not found', statusCode: 404 });
        }

        // Actualizar el estado a 'accepted'
        friendRequest.status = 'accepted';
        await friendRequest.save();

        sendSuccessResponse({ res, data: friendRequest, message: 'Friend request accepted' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to accept friend request' });
    }
};

// Rechazar solicitud de amistad
const rejectFriendRequest = async (req, res) => {
    try {
        const { id } = req.user;
        const { requestId } = req.params;

        // Buscar la solicitud de amistad
        const friendRequest = await Friendship.findOne({
            where: {
                id: requestId,
                followingId: id,
                status: 'pending'
            }
        });

        if (!friendRequest) {
            return sendErrorResponse({ res, message: 'Friend request not found', statusCode: 404 });
        }

        // Eliminar la solicitud de amistad
        await friendRequest.destroy();

        sendSuccessResponse({ res, message: 'Friend request rejected' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to reject friend request' });
    }
};

// Eliminar amigo
const removeFriend = async (req, res) => {
    try {
        const { id } = req.user;
        const { friendId } = req.params;

        // Buscar la amistad en ambas direcciones
        const friendship = await Friendship.findOne({
            where: {
                followerId: id,
                followingId: friendId,
                status: 'accepted'
            }
        });

        const reverseFriendship = await Friendship.findOne({
            where: {
                followerId: friendId,
                followingId: id,
                status: 'accepted'
            }
        });

        if (!friendship && !reverseFriendship) {
            return sendErrorResponse({ res, message: 'Friendship not found', statusCode: 404 });
        }

        // Eliminar ambas direcciones de la amistad
        if (friendship) await friendship.destroy();
        if (reverseFriendship) await reverseFriendship.destroy();

        sendSuccessResponse({ res, message: 'Friend removed successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to remove friend' });
    }
};

// Obtener lista de amigos
const getFriends = async (req, res) => {
    try {
        const { id } = req.user;

        // Ejecutar ambas consultas en paralelo
        const [following, followers] = await Promise.all([
            Friendship.findAll({
                where: { followerId: id },
                include: [
                    {
                        model: User,
                        as: 'Following', // Alias definido en las asociaciones
                        attributes: ['id', 'name', 'surname', 'profile_pic']
                    }
                ]
            }),
            Friendship.findAll({
                where: { followingId: id },
                include: [
                    {
                        model: User,
                        as: 'Follower', // Alias definido en las asociaciones
                        attributes: ['id', 'name', 'surname', 'profile_pic']
                    }
                ]
            })
        ]);

        // Formatear respuestas
        const followingResponse = following.map(friend => ({
            id: friend.Following.id,
            name: friend.Following.name,
            surname: friend.Following.surname,
            profile_pic: friend.Following.profile_pic,
            status: friend.status,
            createdAt: friend.createdAt
        }));

        const followersResponse = followers.map(friend => ({
            id: friend.Follower.id,
            name: friend.Follower.name,
            surname: friend.Follower.surname,
            profile_pic: friend.Follower.profile_pic,
            status: friend.status,
            createdAt: friend.createdAt
        }));

        // Respuesta consolidada
        sendSuccessResponse({
            res,
            data: {
                following: followingResponse,
                followers: followersResponse
            },
            message: 'Friends retrieved successfully'
        });
    } catch (error) {
        console.error(`Error retrieving friends for user ${req.user.id}: ${error.message}`, error);
        sendErrorResponse({ res, error, message: 'Failed to retrieve friends' });
    }
};

export default {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriends
};