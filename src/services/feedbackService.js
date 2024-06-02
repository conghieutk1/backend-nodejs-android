import db from '../models/index';
require('dotenv').config();

let createNewFeedback = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve({
                errCode: 0,
                errMessage: 'OK',
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createNewFeedback,
};
