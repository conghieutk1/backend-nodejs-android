import db from '../models/index';
require('dotenv').config();

let getHistoryByUserId = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let histories = await db.History.findAll({
                where: {
                    userId: id,
                },
                include: [
                    {
                        model: db.Prediction,
                        as: 'predictionData',
                        attributes: {
                            exclude: ['historyId', 'updatedAt', 'createdAt'],
                        },
                        where: {
                            orderNumber: 1,
                        },
                        include: [
                            {
                                model: db.Disease,
                                attributes: {
                                    exclude: ['keyDiseaseId', 'updatedAt', 'createdAt'],
                                },
                            },
                        ],
                    },
                ],
                attributes: {
                    exclude: ['image', 'createdAt'],
                },
                order: [['updatedAt', 'DESC']], // Sắp xếp theo updatedAt giảm dần
                limit: 2, // Giới hạn số lượng kết quả trả về thành 3
                raw: true,
                nest: true,
            });
            resolve(histories);
        } catch (e) {
            reject(e);
        }
    });
};

let getDetailDiseaseMarkdownById = async (diseaseId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let diseaseData = await db.Disease.findOne({
                where: {
                    id: diseaseId,
                },
                raw: true,
                nest: true,
            });
            if (diseaseData) {
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    diseaseData: diseaseData,
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Failded',
                });
            }
        } catch (e) {
            reject({
                errCode: 0,
                errMessage: 'An error occured!',
            });
        }
    });
};

module.exports = {
    getHistoryByUserId,
};
