function capitalizeFirstLetter(text) {
    return text
        .split(' ')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

module.exports = {
    capitalizeFirstLetter,
};
