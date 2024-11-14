import { DataTypes } from "sequelize";
import bcrypt from 'bcryptjs';
import moment from 'moment'

export default (sequelize) => {
    const User = sequelize.define('User',{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: {
                msg: "Email must be validate"
                }
            },
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(64),
            validate: {
                notNull: {
                    msg: "'password' is required."
                },
                notEmpty: {
                    msg: "Please provide a 'password'"
                },
                isLongEnough: (val) => {
                    if (val.length < 8) {
                        throw new Error("Password should be at least 8 characters");
                    }
                },
                hasSpecialCharacter: (val) => {
                    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
                    if (!specialCharacterRegex.test(val)) {
                        throw new Error("Password should contain at least one special character");
                    }
                },
                hasUpperCase: (val) => {
                    const upperCaseRegex = /[A-Z]/;
                    if (!upperCaseRegex.test(val)) {
                        throw new Error("Password should contain at least one uppercase letter");
                    }
                }
            },
            allowNull: false
        },
        profile_pic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bannerImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM("M","F","X","-"),
            allowNull: false
        },
        descriptionProfile: {
            type: DataTypes.STRING,
            allowNull: true
        },
        commentCounts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        postCounts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        followersCounts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        followingCounts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        recoveryCode: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },{
        tableName: 'Users'
    }, {
        indexes: [
            {
              name: 'user_data_index',  // Nombre del índice
              fields: ['email', 'username','name', 'surname'],  // Campos sobre los que se crea el índice
              unique: true,  // Índice único
            },
          ],
      });
    
      return User;
};