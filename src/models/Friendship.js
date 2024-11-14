import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Friendship = sequelize.define('Friendship', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        followerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users', // Nombre de la tabla del modelo User
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        followingId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users', // Nombre de la tabla del modelo User
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        status : {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        
        },
    }, {
        tableName: 'Friendships',
        indexes: [
            {
                name: 'friendship_data_index',
                fields: ['followerId', 'followingId'],
                unique: true
            }
        ]
    });

    return Friendship;
};
