'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Disease extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Thiết lập mối quan hệ hasMany với model History
            // this.hasMany(models.History, {
            //     foreignKey: 'diseaseId', // Tên trường foreign key trong model History
            //     as: 'histories', // Đặt alias cho mối quan hệ
            // });
            // Disease.belongsTo(models.Mar, {
            //     foreignKey: 'doctorId',
            //     targetKey: 'id',
            //     as: 'doctorDataBooking',
            // });
            // Disease.hasOne(models.Markdown, { foreignKey: 'diseaseId' });
            Disease.hasMany(models.LinkImage, {
                foreignKey: 'diseaseId',
                as: 'imageData',
            });
            Disease.hasOne(models.Prediction, { foreignKey: 'diseaseId' });
        }
    }
    Disease.init(
        {
            keyDiseaseName: DataTypes.STRING,
            diseaseName: DataTypes.STRING,
            symtomMarkdown: DataTypes.TEXT('long'),
            precautionMarkdown: DataTypes.TEXT('long'),
            reasonMarkdown: DataTypes.TEXT('long'),
            treatmentMarkdown: DataTypes.TEXT('long'),
            descriptionMarkdown: DataTypes.TEXT('long'),
        },
        {
            sequelize,
            modelName: 'Disease',
        },
    );
    return Disease;
};
