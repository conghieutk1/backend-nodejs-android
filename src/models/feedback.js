'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Feedback extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    Feedback.init(
        {
            email: DataTypes.STRING,
            userName: DataTypes.STRING,
            time: DataTypes.STRING,
            keyDisease: DataTypes.STRING,
            linkImage: DataTypes.STRING,
            comments: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Feedback',
        },
    );
    return Feedback;
};
