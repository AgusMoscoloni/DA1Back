import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Advertisement = sequelize.define('Advertisement', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: {
                    msg: "La URL de la imagen debe ser válida"
                }
            }
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        websiteUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: {
                    msg: "La URL del sitio web debe ser válida"
                }
            }
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: {
                    msg: "La fecha de inicio debe ser una fecha válida"
                }
            }
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: {
                    msg: "La fecha de fin debe ser una fecha válida"
                },
                isAfterStartDate(value) {
                    if (value <= this.startDate) {
                        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
                    }
                }
            }
        }
    }, {
        tableName: 'Advertisements',
        indexes: [
            {
                name: 'advertisement_date_index',
                fields: ['startDate', 'endDate']
            }
        ]
    });

    return Advertisement;
};
