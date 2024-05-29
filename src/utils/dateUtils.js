// dateUtils.js

/**
 * Chuyển đổi timestamp thành định dạng ngày tháng năm DD/MM/YYYY
 * @param {number} timestamp - Timestamp cần chuyển đổi
 * @returns {string} - Ngày tháng năm theo định dạng DD/MM/YYYY
 */
function formatTimestampToDate(timestamp) {
    let date = new Date(timestamp);

    let day = date.getDate();
    let month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    let year = date.getFullYear();

    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return `${day}/${month}/${year}`;
}

module.exports = {
    formatTimestampToDate,
};
