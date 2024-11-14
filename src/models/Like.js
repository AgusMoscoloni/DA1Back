import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Like = sequelize.define('Like', {
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
            }
        },
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Posts', // Nombre de la tabla del modelo Post
                key: 'id'
            }
        }
    }, {
        tableName: 'Likes',
        timestamps: true // Guarda createdAt y updatedAt para registrar cuándo se dio el like
    });

    // Relaciones
    Like.associate = (models) => {
        Like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Like.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };

    return Like;
};
