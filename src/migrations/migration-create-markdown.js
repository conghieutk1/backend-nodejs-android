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
            symtomHTML: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            symtomMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            precautionHTML: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            precautionMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            reasonHTML: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            reasonMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            treatmentHTML: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            treatmentMarkdown: {
                allowNull: false,
                type: Sequelize.TEXT('long'),
            },
            description: {
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
