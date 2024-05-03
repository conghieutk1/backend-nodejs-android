'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Disease extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    Disease.init(
        {
            diseaseName: DataTypes.STRING,
            plantId: DataTypes.INTEGER,
            markdownId: DataTypes.INTEGER,
            decription: DataTypes.STRING,
            // name: DataTypes.STRING,
            // gender: DataTypes.STRING,
            // address: DataTypes.STRING,
            // phoneNumber: DataTypes.STRING,
            // avatar: DataTypes.BLOB,
        },
        {
            sequelize,
            modelName: 'Disease',
        },
    );
    return Disease;
};
