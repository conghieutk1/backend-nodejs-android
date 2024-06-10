'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Do nothing, as we don't want to drop SequelizeMeta in an up migration
        // Nếu bạn muốn thêm một migration để tạo lại bảng SequelizeMeta sau này, bạn có thể viết mã trong hàm up ở đây
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('SequelizeMeta');
    },
};
