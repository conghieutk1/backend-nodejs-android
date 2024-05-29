'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Diseases', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            diseaseName: {
                type: Sequelize.STRING,
            },
            keyDiseaseName: {
                type: Sequelize.STRING,
            },
            symtomMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            precautionMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            reasonMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            treatmentMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            descriptionMarkdown: {
                allowNull: true,
                type: Sequelize.TEXT('long'),
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Diseases');
    },
};
