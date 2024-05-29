'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            History.hasMany(models.Prediction, {
                foreignKey: 'historyId',
                as: 'predictionData', // alias này phải được sử dụng nhất quán
            });
        }
    }
    History.init(
        {
            userId: DataTypes.INTEGER,
            image: DataTypes.BLOB,
            time: DataTypes.STRING,
            linkImage: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'History',
        },
    );
    return History;
};
