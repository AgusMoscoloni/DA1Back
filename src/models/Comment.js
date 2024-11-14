import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Posts', // Nombre de la tabla del modelo Post
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users', // Nombre de la tabla del modelo User
                key: 'id'
            }
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "El comentario no puede estar vacío"
                }
            }
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Comments',
        indexes: [
            {
                name: 'comment_data_index',
                fields: ['postId', 'userId', 'date']
            }
        ]
    });

    return Comment;
};
