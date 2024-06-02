import feedbackService from '../services/feedbackService';
import db from '../models/index';
require('dotenv').config();
import i18nUtils from '../utils/language/i18nUtils';
const { CopyObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/connectS3AWS');

let createFeedback = async (req, res) => {
    try {
        const { email, selectedOption, userName, comments, linkImage } = req.body;

        if (!linkImage) {
            return res.status(400).json({ errMessage: 'Có lỗi khi gửi phản hồi' });
        }
        // linkImage: https://plantix-image-pool.s3.ap-southeast-1.amazonaws.com/history/3/1717323970710
        // Phân tích URL để lấy bucket và key của ảnh gốc
        const parsedUrl = new URL(linkImage);
        const originalKey = parsedUrl.pathname.substring(1); // Bỏ ký tự '/' đầu tiên. Ex: history/3/1717323970710
        const bucketName = parsedUrl.hostname.split('.')[0]; // Ex: plantix-image-pool

        // Lấy tên file từ originalKey. Ex: 1717323970710
        // const fileName = originalKey.split('/').pop();

        // Chuyển selectedOption thành khoá bệnh
        const keyDisease = i18nUtils.reverseTranslate('en', selectedOption);

        // Đặt tên file và thư mục mới trên S3. Ex: feedbacks/baterial-spot/1717323970710
        const newKey = `feedbacks/${keyDisease}/${originalKey.split('/').pop()}`;

        // Copy file từ vị trí cũ sang vị trí mới
        const copyParams = {
            Bucket: bucketName,
            CopySource: `/${bucketName}/${originalKey}`,
            Key: newKey,
        };
        try {
            await s3Client.send(new CopyObjectCommand(copyParams));
            // Ex: https://plantix-image-pool.s3.ap-southeast-1.amazonaws.com/feedbacks/baterial-spot/1717323970710
            const newImageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;

            // Lưu thông tin vào database
            await db.Feedback.create({
                email,
                userName,
                keyDisease: keyDisease,
                time: `${new Date().getTime()}`,
                comments,
                linkImage: newImageUrl,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Có lỗi khi gửi phản hồi' });
        }

        res.status(201).json({ errMessage: 'Cảm ơn bạn đã phản hồi!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Có lỗi khi gửi phản hồi' });
    }
};
module.exports = { createFeedback };
