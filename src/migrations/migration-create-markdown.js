'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Markdowns', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            diseaseId: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('Markdowns');
    },
};
