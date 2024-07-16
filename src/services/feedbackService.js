import db from '../models/index';
require('dotenv').config();
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/connectS3AWS');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/conectDB'); 

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
let countFeedbacks = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const count = await db.Feedback.count();
            resolve(count);
        } catch (e) {
            reject(e);
        }
    });
};
let getAllFeedbacksPaging = (start, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let feedbacks = await db.Feedback.findAll({
                attributes: {
                    exclude: ['updatedAt', 'createdAt'],
                },
                offset: start,
                limit: limit,
                raw: true,
                nest: true,
                order: [['updatedAt', 'DESC']],
            });
            resolve(feedbacks);
        } catch (e) {
            reject(e);
        }
    });
};
let deleteFeedback = (feedbackId, imageUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Feedback.destroy({
                where: {
                    id: feedbackId,
                },
            });
            // delete image aws s3
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
let getDataForFeedbackChart = (startDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            const today = new Date();

            // Truy vấn dữ liệu từ cơ sở dữ liệu
            let feedbacks = await db.Feedback.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, today],
                    },
                },
                attributes: [
                    [fn('DATE', col('createdAt')), 'date'],
                    [fn('COUNT', col('id')), 'totalFeedbacks'],
                    [fn('SUM', literal('CASE WHEN "isTrue" THEN 1 ELSE 0 END')), 'trueFeedbacks']
                ],
                group: ['date'],
                order: [['date', 'ASC']],
                raw: true,
                nest: true,
            });

            // Tính toán tỷ lệ phần trăm phản hồi đúng từ dữ liệu đã truy vấn
            const dates = feedbacks.map(fb => fb.date);
            const totalFeedbacks = feedbacks.map(fb => parseInt(fb.totalFeedbacks, 10));
            const trueFeedbacks = feedbacks.map(fb => parseInt(fb.trueFeedbacks, 10));

            // Tính tỷ lệ phần trăm phản hồi đúng
            const truePercentages = totalFeedbacks.map((total, index) => {
                return total > 0 ? ((trueFeedbacks[index] / total) * 100).toFixed(2) : '0.00';
            });

            resolve({ dates, totalFeedbacks, truePercentages });
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    createNewFeedback,
    countFeedbacks,
    getAllFeedbacksPaging,
    deleteFeedback,
    getDataForFeedbackChart
};
