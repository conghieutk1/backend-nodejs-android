import db from '../models/index';
require('dotenv').config();
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/connectS3AWS');

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
module.exports = {
    createNewFeedback,
    countFeedbacks,
    getAllFeedbacksPaging,
    deleteFeedback,
};
