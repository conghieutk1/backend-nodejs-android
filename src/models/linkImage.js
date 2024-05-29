'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class LinkImage extends Model {
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
            LinkImage.belongsTo(models.Disease, {
                foreignKey: 'diseaseId',
                targetKey: 'id',
                as: 'imageData',
            });
        }
    }
    LinkImage.init(
        {
            diseaseId: DataTypes.INTEGER,
            linkImage: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'LinkImage',
        },
    );
    return LinkImage;
};
