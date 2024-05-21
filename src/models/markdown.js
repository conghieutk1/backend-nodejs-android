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
        }
    }
    Markdown.init(
        {
            symtomMarkdown: DataTypes.TEXT('long'),
            precautionMarkdown: DataTypes.TEXT('long'),
            reasonMarkdown: DataTypes.TEXT('long'),
            treatmentMarkdown: DataTypes.TEXT('long'),
            descriptionMarkdown: DataTypes.TEXT('long'),
            // symtomHTML: DataTypes.TEXT('long'),
            // precautionHTML: DataTypes.TEXT('long'),
            // reasonHTML: DataTypes.TEXT('long'),
            // treatmentHTML: DataTypes.TEXT('long'),
        },
        {
            sequelize,
            modelName: 'Markdown',
        },
    );
    return Markdown;
};
