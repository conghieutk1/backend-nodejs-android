'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Plant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    Plant.init(
        {
            plantName: DataTypes.STRING,
            icon: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Plant',
        },
    );
    return Plant;
};
