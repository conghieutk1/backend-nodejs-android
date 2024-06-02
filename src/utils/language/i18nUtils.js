const fs = require('fs');
const path = require('path');

// Đọc file JSON và parse nó thành đối tượng JavaScript
const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf-8'));

// Hàm để lấy từ theo ngôn ngữ và khóa
function translate(language, key) {
    if (!translations[language]) {
        throw new Error(`Ngôn ngữ ${language} không được hỗ trợ.`);
    }

    const translation = translations[language][key];
    if (!translation) {
        throw new Error(`Từ ${key} không tìm thấy trong ngôn ngữ ${language}.`);
    }

    return translation;
}

// Hàm để lấy khóa ban đầu dựa trên giá trị và ngôn ngữ
function reverseTranslate(language, value) {
    if (!translations[language]) {
        throw new Error(`Ngôn ngữ ${language} không được hỗ trợ.`);
    }

    for (const [key, translation] of Object.entries(translations[language])) {
        if (translation === value) {
            return key;
        }
    }

    throw new Error(`Giá trị ${value} không tìm thấy trong ngôn ngữ ${language}.`);
}

module.exports = {
    translate,
    reverseTranslate,
};
