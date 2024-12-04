import { User, Post, Comments, Friendship, Like, Favorite} from '../models/index.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import UserService from '../services/User.services.js';

const getProfile = async (req, res) => {
    try {
        const { id } = req.user;

        // Buscar el usuario junto con sus posts
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Post,
                    as: 'Posts',
                    attributes: ['id', 'title', 'caption', 'location', 'media', 'date', 'likesCount'],
                    order: [['date', 'DESC']],
                    include : [
                        {
                            model: Like,
                            as: 'Likes',
                            attributes: ['userId']
                        },
                        {
                            model: Favorite,
                            as: 'Favorites',
                            attributes: ['userId']
                        }
                    ]
                },
                {
                    model: Friendship,
                    as: 'Friendships',
                    attributes: ['followingId', "followerId"]
                }
            ]
        });
        
        if (!user) {
            return sendErrorResponse({ res, message: 'User not found', statusCode: 404 });
        }

        // Obtener el nivel del usuario en función de sus publicaciones y comentarios
        const lvl = getLevel(user.postCounts, user.commentCounts);
        const likesCount = user.Posts?.reduce((total, post) => {
            return total + (post.Likes?.filter(like => like.userId === id).length || 0);
          }, 0);
          
          const favorites = user.Posts?.reduce((total, post) => {
            return total + (post.Favorites?.filter(favorite => favorite.userId === id).length || 0);
          }, 0);
        // Formatear la respuesta del perfil del usuario
        const response = {
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            profile_pic: user.profile_pic,
            bannerImage: user.bannerImage,
            gender: user.gender,
            likesCount,
            favoritesCount: favorites,
            descriptionProfile: user.descriptionProfile,
            followersCounts: user.Friendships.filter(friendship => friendship.followingId === id).length,
            followingCounts: user.Friendships.filter(friendship => friendship.followerId === id).length,
            lvl,
            posts: user.Posts.map(post => ({
                id: post.id,
                title: post.title,
                caption: post.caption,
                location: post.location,
                media: post.media,
                date: post.date,
                likesCount: post.likesCount
            }))
        };

        sendSuccessResponse({ res, data: response, message: 'Profile retrieved successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to retrieve profile' });
    }
};

const getLevel = (postCounts, commentCounts) => {
    
    if (postCounts < 2 ) {
        return "1";
    } else if (postCounts >= 2 && postCounts < 4) {
        return "2";
    } else if (postCounts >= 4 && commentCounts < 4) {
        return "3";
    } else if (postCounts >= 4 && commentCounts >= 4) {
        return "4"
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, surname, username, profile_pic, gender, descriptionProfile, bannerImage } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return sendErrorResponse({ res, message: 'User not found', statusCode: 404 });
        }

        // Actualizar solo los campos que existen en el cuerpo de la solicitud
        await user.update({
            ...(name && { name }),
            ...(surname && { surname }),
            ...(username && { username }),
            ...(profile_pic && { profile_pic }),
            ...(bannerImage && { bannerImage }),
            ...(gender && { gender }),
            ...(descriptionProfile && { descriptionProfile })
        });

        // Enviar el perfil actualizado en la respuesta
        sendSuccessResponse({
            res,
            message: 'Profile updated successfully',
            data: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                profile_pic: user.profile_pic,
                bannerImage: user.bannerImage,
                gender: user.gender,
                descriptionProfile: user.descriptionProfile
            }
        });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to update profile' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findByPk(userId);

        if (!user) {
            return sendErrorResponse({ res, message: 'User not found', statusCode: 404 });
        }

        await user.destroy();

        sendSuccessResponse({ res, message: 'Account deleted successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to delete account' });
    }
};
const searchUsersController = async (req, res) => {
    const { query } = req.query;  // El parámetro de búsqueda se envía como una query string
    const { id } = req.user;
    if (!query || query.trim() === '') {
        return sendErrorResponse({ res, message: 'No query provided', statusCode: 400 });
    }

    try {
        const users = await UserService.searchUsers(query);

        if (users.length === 0) {
            return sendSuccessResponse({ res, message: 'No users found', data: [], statusCode: 200 });
        }
        const response = users.map(user => ({
            id: user.id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            profile_pic: user.profile_pic,
            isFriend: user.Friendships && user.Friendships.some(friend => friend.followingId === id) || false
        }));
        return sendSuccessResponse({ res, data: response, message: 'Users found', statusCode: 200 });
    } catch (error) {
        return sendErrorResponse({ res, error, message: 'Error searching users', statusCode: 500 });
    }
};

const getFriends = async (req, res) => {
    try {
        const { userId } = req.user;

        const friends = await FriendShipServices.getFriends(userId);
        const followingIds = friends.map(friend => friend.followingId);

        const users = await User.findAll({
            where: {
                id: followingIds
            },
            attributes: ['id', 'name', 'surname', 'profile_pic']
        });

        sendSuccessResponse({ res, data: users, message: 'Friends retrieved successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to retrieve friends' });
    }
};

const getUserInfo = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return sendErrorResponse({ res, message: 'User not found', statusCode: 404 });
        }

        const response = {
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            profile_pic: user.profile_pic,
            gender: user.gender,
            descriptionProfile: user.descriptionProfile,
            followersCounts: user.followersCounts,
            followingCounts: user.followingCounts,
        };

        sendSuccessResponse({ res, data: response, message: 'User info retrieved successfully' });
    } catch (error) {
        sendErrorResponse({ res, error, message: 'Failed to retrieve user info' });
    }
};

export default { getProfile, updateProfile,deleteAccount,searchUsersController };