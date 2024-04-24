'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    User.init(
        {
            account: DataTypes.STRING,
            password: DataTypes.STRING,
            nameUser: DataTypes.STRING,
            role: DataTypes.STRING,
            gender: DataTypes.STRING,
            dob: DataTypes.STRING,
            address: DataTypes.STRING,
            phoneNumber: DataTypes.STRING,
            avatar: DataTypes.BLOB,
        },
        {
            sequelize,
            modelName: 'User',
        },
    );
    return User;
};
