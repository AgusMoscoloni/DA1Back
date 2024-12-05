import { sequelize } from "../config/database.js";
import UserModel from './User.js';
import PostModel from './Post.js';
import FriendshipModel from './Friendship.js';
import CommentModel from './Comment.js';
import FavoriteModel from './Favorite.js';
import AdsModel from './Ads.js';
import LikeModel from './Like.js';  // Importa el modelo Like

// Inicializar los modelos
const User = UserModel(sequelize);
const Post = PostModel(sequelize);
const Friendship = FriendshipModel(sequelize);
const Comments = CommentModel(sequelize);
const Favorite = FavoriteModel(sequelize);
const Ads = AdsModel(sequelize);
const Like = LikeModel(sequelize);  // Inicializa el modelo Like

// Definir relaciones entre los modelos

// Relación Usuario - Publicaciones
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Friendship, { 
    foreignKey: 'followerId', 
    as: 'FollowingFriendships',
    onDelete: 'CASCADE'
});

User.hasMany(Friendship, { 
    foreignKey: 'followingId', 
    as: 'FollowerFriendships' ,
    onDelete : 'CASCADE'
});
Friendship.belongsTo(User, { 
    foreignKey: 'followerId', 
    as: 'Follower' 
});

Friendship.belongsTo(User, { 
    foreignKey: 'followingId', 
    as: 'Following' 
});
// Relación Publicación - Comentarios
Post.hasMany(Comments, { foreignKey: 'postId' });
Comments.belongsTo(Post, { foreignKey: 'postId' });

// Relación Usuario - Comentarios
User.hasMany(Comments, { foreignKey: 'userId' });
Comments.belongsTo(User, { foreignKey: 'userId' });

// Relación Usuario - Favoritos
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

// Relación Publicación - Favoritos
Post.hasMany(Favorite, { foreignKey: 'postId' });
Favorite.belongsTo(Post, { foreignKey: 'postId' });

// Relación Usuario - Likes
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

// Relación Publicación - Likes
Post.hasMany(Like, { foreignKey: 'postId' });
Like.belongsTo(Post, { foreignKey: 'postId' });


// Exportar los modelos y la conexión de Sequelize
export { sequelize, User, Post, Friendship, Comments, Favorite, Ads, Like };
