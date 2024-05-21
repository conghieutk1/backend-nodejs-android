'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    History.init(
        {
            userId: DataTypes.INTEGER,
            diseaseId: DataTypes.INTEGER,
            predictResult: DataTypes.JSON,
            image: DataTypes.BLOB,
            time: DataTypes.STRING, //
        },
        {
            sequelize,
            modelName: 'History',
        },
    );
    return History;
};
