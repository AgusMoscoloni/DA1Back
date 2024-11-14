import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Favorite = sequelize.define('Favorite', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users', // Nombre de la tabla del modelo User
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Posts', // Nombre de la tabla del modelo Post
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'Favorites',
        indexes: [
            {
                name: 'favorite_user_post_index',
                fields: ['userId', 'postId'],
                unique: true
            }
        ]
    });

    return Favorite;
};
