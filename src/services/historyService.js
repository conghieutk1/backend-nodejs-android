import db from '../models/index';
require('dotenv').config();
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/connectS3AWS');
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
                    exclude: ['createdAt'],
                },
                order: [['updatedAt', 'DESC']], // Sắp xếp theo updatedAt giảm dần
                limit: 2, // Giới hạn số lượng kết quả trả về thành 2
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

let getAllHistories = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let histories = await db.History.findAll({
                attributes: {
                    exclude: ['image', 'updatedAt', 'createdAt'],
                },
                raw: true,
                nest: true,
                include: [
                    {
                        model: db.Prediction,
                        as: 'predictionData',
                        attributes: ['diseaseId'],
                        where: {
                            orderNumber: 1,
                        },
                        include: [
                            {
                                model: db.Disease,
                                attributes: ['id', 'keyDiseaseName', 'diseaseName'],
                            },
                        ],
                    },
                ],
            });
            resolve(histories);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllHistoriesForPage = (start, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let histories = await db.History.findAll({
                attributes: {
                    exclude: ['image', 'createdAt'],
                },
                offset: start,
                limit: limit,
                raw: true,
                nest: true,
                order: [['updatedAt', 'DESC']],
                include: [
                    {
                        model: db.Prediction,
                        as: 'predictionData',
                        attributes: ['diseaseId'],
                        where: {
                            orderNumber: 1,
                        },
                        include: [
                            {
                                model: db.Disease,
                                attributes: ['id', 'keyDiseaseName', 'diseaseName'],
                            },
                        ],
                    },
                ],
            });
            resolve(histories);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteHistory = (historyId, imageUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.History.destroy({
                where: {
                    id: historyId,
                },
            });
            deleteImage(imageUrl);
            resolve({ errCode: 0, errMessage: 'Delete history succeed!' });
        } catch (e) {
            reject(e);
        }
    });
};

async function deleteImage(imageUrl) {
    // Phân tích đường link để trích xuất bucket và key
    const url = new URL(imageUrl);
    const bucketName = url.hostname.split('.')[0];
    const key = decodeURIComponent(url.pathname.slice(1));

    // Cấu hình DeleteObjectCommand
    const deleteParams = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`Ảnh đã bị xóa: ${imageUrl}`);
    } catch (error) {
        console.error(`Lỗi khi xóa ảnh: ${error.message}`);
    }
}

module.exports = {
    getHistoryByUserId,
    getAllHistories,
    getAllHistoriesForPage,
    countHistory,
    deleteHistory,
};
