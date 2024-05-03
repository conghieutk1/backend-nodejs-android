'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Markdown extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Markdown.belongsTo(models.User, { foreignKey: 'doctorId' });
        }
    }
    Markdown.init(
        {
            symtomHTML: DataTypes.TEXT('long'),
            symtomMarkdown: DataTypes.TEXT('long'),
            precautionHTML: DataTypes.TEXT('long'),
            precautionMarkdown: DataTypes.TEXT('long'),
            reasonHTML: DataTypes.TEXT('long'),
            reasonMarkdown: DataTypes.TEXT('long'),
            treatmentHTML: DataTypes.TEXT('long'),
            treatmentMarkdown: DataTypes.TEXT('long'),
            description: DataTypes.TEXT('long'),
        },
        {
            sequelize,
            modelName: 'Markdown',
        },
    );
    return Markdown;
};
