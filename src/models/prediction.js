'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Prediction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    Prediction.init(
        {
            diseaseId: DataTypes.INTEGER,
            orderNumber: DataTypes.INTEGER,
            probability: DataTypes.FLOAT,
            historyId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'Prediction',
        },
    );
    return Prediction;
};
