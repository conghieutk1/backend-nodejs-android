import feedbackService from '../services/feedbackService';
import db from '../models/index';
require('dotenv').config();
import i18nUtils from '../utils/language/i18nUtils';
import dateUtils from '../utils/dateUtils';
const { CopyObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/connectS3AWS');

let createFeedback = async (req, res) => {
    try {
        const { email, userName, comments, linkImage } = req.body;
        // console.log('req.body = ', req.body);
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
        const diseaseUserSelected = i18nUtils.reverseTranslate('vi', req.body.selectedUserDisease);
        const diseaseModelPrediction = i18nUtils.reverseTranslate('vi', req.body.diseaseModelPrediction);
        const isTrue = req.body.selectedTrueFalseOption === 'Đúng' ? true : false;
        // Đặt tên file và thư mục mới trên S3. Ex: feedbacks/baterial-spot/1717323970710
        const newKey = `feedbacks/${diseaseUserSelected}/${originalKey.split('/').pop()}`;

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
                isTrue,
                diseaseModelPrediction,
                diseaseUserSelected,
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
let getFeedbackPage = async (req, res) => {
    try {
        const { pageNumber = 1 } = req.query; // Default to page 1 if not provided
        const pageSize = 10; // Set the desired page size
        const countFeedback = await feedbackService.countFeedbacks();
        const totalPages = Math.ceil(countFeedback / pageSize);
        const start = (pageNumber - 1) * pageSize;

        const response = await feedbackService.getAllFeedbacksPaging(start, pageSize);

        let listFeedbacks = [];
        for (let i = 0; i < response.length; i++) {
            let {
                id,
                email,
                userName,
                time,
                isTrue,
                diseaseModelPrediction,
                diseaseUserSelected,
                linkImage,
                comments,
            } = response[i];
            let timeFormat = dateUtils.formatTimestampToDate3(parseInt(time));
            const enDiseaseModelPrediction = i18nUtils.translate('en', diseaseModelPrediction);
            const viDiseaseModelPrediction = i18nUtils.translate('vi', diseaseModelPrediction);
            const enDiseaseUserSelected = i18nUtils.translate('en', diseaseUserSelected);
            const viDiseaseUserSelected = i18nUtils.translate('vi', diseaseUserSelected);
            listFeedbacks.push({
                id,
                email,
                userName,
                timeFormat,
                enDiseaseModelPrediction,
                viDiseaseModelPrediction,
                isTrue,
                enDiseaseUserSelected,
                viDiseaseUserSelected,
                linkImage,
                comments,
            });
        }
        res.render('feedbacks/manage-feedbacks.ejs', {
            totalRecords: countFeedback,
            totalPages: totalPages,
            currentPage: parseInt(pageNumber),
            pageSize: pageSize,
            feedbacks: listFeedbacks,
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch sử:', error);
        return res.status(500).send({ message: 'Lỗi máy chủ nội bộ' });
    }
};

let getAllFeedbackForManageSystem = async (req, res) => {
    const { pageNumber = 1 } = req.query; // Default to page 1 if not provided
    const pageSize = 10; // Set the desired page size
    const countFeedbacks = await feedbackService.countFeedbacks();
    const totalPages = Math.ceil(countFeedbacks / pageSize);
    const start = (pageNumber - 1) * pageSize;
    const response = await feedbackService.getAllFeedbacksPaging(start, pageSize);

    let feedbacks = [];
    for (let i = 0; i < response.length; i++) {
        let { id, email, userName, time, isTrue, diseaseModelPrediction, diseaseUserSelected, linkImage, comments } =
            response[i];
        let timeFormat = dateUtils.formatTimestampToDate3(parseInt(time));
        const enDiseaseModelPrediction = i18nUtils.translate('en', diseaseModelPrediction);
        const viDiseaseModelPrediction = i18nUtils.translate('vi', diseaseModelPrediction);
        const enDiseaseUserSelected = i18nUtils.translate('en', diseaseUserSelected);
        const viDiseaseUserSelected = i18nUtils.translate('vi', diseaseUserSelected);
        feedbacks.push({
            id,
            email,
            userName,
            timeFormat,
            enDiseaseModelPrediction,
            viDiseaseModelPrediction,
            isTrue,
            enDiseaseUserSelected,
            viDiseaseUserSelected,
            linkImage,
            comments,
        });
    }

    return res.status(200).json({
        totalRecords: countFeedbacks,
        totalPages: totalPages,
        currentPage: parseInt(pageNumber),
        pageSize: pageSize,
        feedbacks: feedbacks,
    });
};
let deleteFeedback = async (req, res) => {
    let id = req.query.feedbackId;
    let currentPage = req.query.currentPage;
    let feedback = await db.Feedback.findOne({
        where: { id: id },
        attributes: ['linkImage'],
    });
    if (!feedback) {
        return res.status(404).send({ message: 'Không tìm thấy phản hồi' });
    } else {
        await feedbackService.deleteFeedback(id, feedback.linkImage);

        const pageSize = 10; // Set the desired page size
        const countFeedback = await feedbackService.countFeedbacks();
        const totalPages = Math.ceil(countFeedback / pageSize);
        if (totalPages < currentPage) {
            currentPage = totalPages;
        }
        const start = totalPages === 0 ? 0 : (currentPage - 1) * pageSize;

        const response = await feedbackService.getAllFeedbacksPaging(start, pageSize);

        let listFeedbacks = [];
        for (let i = 0; i < response.length; i++) {
            let {
                id,
                email,
                userName,
                time,
                isTrue,
                diseaseModelPrediction,
                diseaseUserSelected,
                linkImage,
                comments,
            } = response[i];
            let timeFormat = dateUtils.formatTimestampToDate3(parseInt(time));
            const enDiseaseModelPrediction = i18nUtils.translate('en', diseaseModelPrediction);
            const viDiseaseModelPrediction = i18nUtils.translate('vi', diseaseModelPrediction);
            const enDiseaseUserSelected = i18nUtils.translate('en', diseaseUserSelected);
            const viDiseaseUserSelected = i18nUtils.translate('vi', diseaseUserSelected);
            listFeedbacks.push({
                id,
                email,
                userName,
                timeFormat,
                enDiseaseModelPrediction,
                viDiseaseModelPrediction,
                isTrue,
                enDiseaseUserSelected,
                viDiseaseUserSelected,
                linkImage,
                comments,
            });
        }

        res.render('feedbacks/manage-feedbacks.ejs', {
            totalRecords: countFeedback,
            totalPages: totalPages,
            currentPage: parseInt(currentPage),
            pageSize: pageSize,
            feedbacks: listFeedbacks,
        });
    }
};
module.exports = { createFeedback, getFeedbackPage, getAllFeedbackForManageSystem, deleteFeedback };
