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
function formatTimestampToDate2(timestamp) {
    // Chuyển đổi từ giây sang milliseconds
    let date = new Date(timestamp * 1000);

    let day = date.getDate();
    let month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0

    // Định dạng ngày và tháng
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return `Hôm nay, ${day} tháng ${month}`;
}
function formatTimestampToDate3(timestamp) {
    // Chuyển đổi từ giây sang milliseconds
    let date = new Date(timestamp);

    let day = date.getDate();
    let month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    return `${hours}:${minutes} ${day}/${month}/${year} `;
}

module.exports = {
    formatTimestampToDate,
    formatTimestampToDate2,
    formatTimestampToDate3,
};
