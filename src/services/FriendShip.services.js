import { Friendship } from '../models/index.js';

const getFriends = async (userId) => {
    try {
        const friends = await Friendship.findAll({
            where: {
                followerId: userId
            }
        });
        return friends;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default { getFriends };