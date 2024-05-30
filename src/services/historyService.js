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

let countHistory = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const count = await db.History.count();
            resolve(count);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllHistories = (start, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let histories = await db.History.findAll({
                attributes: {
                    exclude: ['image', 'updatedAt', 'createdAt'],
                },
                offset: start,
                limit: limit,
                raw: true,
                nest: true,
            });
            resolve(histories);
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getHistoryByUserId,
    getAllHistories,
    countHistory,
};
