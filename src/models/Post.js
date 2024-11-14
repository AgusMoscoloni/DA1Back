import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Post = sequelize.define('Post', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        caption: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        media: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        likesCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {
        tableName: 'Posts',
        indexes: [
            {
                name: 'post_data_index',
                fields: ['userId', 'title', 'location', 'date']
            }
        ]
    });

    return Post;
};
