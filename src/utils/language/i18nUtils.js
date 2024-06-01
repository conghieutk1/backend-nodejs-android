const fs = require('fs');
const path = require('path');

// Đọc file JSON và parse nó thành đối tượng JavaScript
const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf-8'));

// Hàm để lấy từ theo ngôn ngữ và khóa
function translate(language, key) {
    if (!translations[language]) {
        throw new Error(`Language ${language} not supported.`);
    }

    const translation = translations[language][key];
    if (!translation) {
        throw new Error(`Translation key ${key} not found for language ${language}.`);
    }

    return translation;
}

module.exports = {
    translate,
};
