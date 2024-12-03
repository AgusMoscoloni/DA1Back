
import { User, Friendship} from '../models/index.js';
import { Op } from 'sequelize';

const searchUsers = async (searchQuery) => {
    try {
      const searchTerms = searchQuery.split(' ').map(term => term.trim());
  
      const users = await User.findAll({
        where: {
          [Op.and]: searchTerms.map(term => ({
            [Op.or]: [
              { username: { [Op.iLike]: `%${term}%` } },
              { name: { [Op.iLike]: `%${term}%` } },
              { surname: { [Op.iLike]: `%${term}%` } },
            ],
          })),
          include : [
            {
              model: Friendship,
              as: 'Followers',
              attributes: ['followingId']
            }
          ]
        },
        attributes: ['id', 'email', 'username', 'name', 'surname', 'profile_pic'],
        limit: 10,
      });
  
      return users;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  };
  
  export default { searchUsers };