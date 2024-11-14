import { sequelize } from "../config/database.js";
import UserModel from './User.js';
import PostModel from './Post.js';
import FriendshipModel from './Friendship.js';
import CommentModel from './Comment.js';
import FavoriteModel from './Favorite.js';
import AdsModel from './Ads.js';

// Inicializar los modelos
const User = UserModel(sequelize);
const Post = PostModel(sequelize);
const Friendship = FriendshipModel(sequelize);
const Comments = CommentModel(sequelize);
const Favorite = FavoriteModel(sequelize);
const Ads = AdsModel(sequelize);

// Definir relaciones entre los modelos

// Relación Usuario - Publicaciones
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Relación de muchos a muchos para Amistades/Seguidores (Friendship)
User.belongsToMany(User, {
    through: Friendship,
    as: 'Followers', // Usuarios que siguen al usuario actual
    foreignKey: 'followingId',
    otherKey: 'followerId'
});
User.belongsToMany(User, {
    through: Friendship,
    as: 'Following', // Usuarios seguidos por el usuario actual
    foreignKey: 'followerId',
    otherKey: 'followingId'
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

// Exportar los modelos y la conexión de Sequelize
export { sequelize, User, Post, Friendship, Comments, Favorite, Ads };
