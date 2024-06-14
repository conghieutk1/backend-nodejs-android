import historyService from '../services/historyService';
import CRUDService from '../services/CRUDService';
import db from '../models/index';
require('dotenv').config();
import dateUtils from '../utils/dateUtils';
import i18nUtils from '../utils/language/i18nUtils';

let getDataHistoryComponent = async (req, res) => {
    try {
        let id = req.query.userId;
        if (!id) {
            return res.status(400).send({ message: 'User ID là bắt buộc' });
        }

        let response = await historyService.getHistoryByUserId(id);
        if (!response || !Array.isArray(response)) {
            return res.status(500).send({ message: 'Phản hồi không hợp lệ từ dịch vụ' });
        }
        // console.log('response: ', response);
        let data = [];
        for (let i = 0; i < response.length; i++) {
            let { id, time, linkImage, predictionData } = response[i];
            let diseaseName = predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let DateTime = 'Ngày ' + dateUtils.formatTimestampToDate(parseInt(time));
            data.push({ id, DateTime, linkImage, diseaseName, keyDiseaseName });
        }

        // Tắt caching bằng cách thiết lập các headers thích hợp
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.status(200).send({
            errCode: 0,
            errMessage: 'OK',
            histories: data,
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch sử:', error);
        return res.status(500).send({ message: 'Lỗi máy chủ nội bộ' });
    }
};

let getDataForAllHistoriesPage = async (req, res) => {
    try {
        let id = req.query.userId;
        if (!id) {
            return res.status(400).send({ message: 'User ID là bắt buộc' });
        }

        let response = await historyService.getAllHistoriesForPageByUserAndroid(id, 0, 10);
        if (!response || !Array.isArray(response)) {
            return res.status(500).send({ message: 'Phản hồi không hợp lệ từ dịch vụ' });
        }

        // let data = [];
        // for (let i = 0; i < response.length; i++) {
        //     let { time, linkImage, predictionData } = response[i];
        //     let diseaseName = predictionData?.Disease?.diseaseName || 'Unknown';
        //     let keyDiseaseName = predictionData?.Disease?.keyDiseaseName || 'Unknown';
        //     let DateTime = dateUtils.formatTimestampToDate3(parseInt(time));
        //     data.push({ DateTime, linkImage, diseaseName, keyDiseaseName });
        // }
        let data = response.map((item) => {
            let { id, time, linkImage, predictionData } = item;
            let diseaseName = predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let DateTime = dateUtils.formatTimestampToDate3(parseInt(time));
            return { historyId: id, DateTime, linkImage, diseaseName, keyDiseaseName };
        });
        // Tắt caching bằng cách thiết lập các headers thích hợp
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.status(200).send({
            errCode: 0,
            errMessage: 'OK',
            histories: data,
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch sử:', error);
        return res.status(500).send({ message: 'Lỗi máy chủ nội bộ' });
    }
};

let getManageHistoryPage = async (req, res) => {
    try {
        const { pageNumber = 1 } = req.query; // Default to page 1 if not provided
        const pageSize = 10; // Set the desired page size
        const countHistory = await historyService.countHistory();
        const totalPages = Math.ceil(countHistory / pageSize);
        const start = (pageNumber - 1) * pageSize;

        const response = await historyService.getAllHistoriesForPage(start, pageSize);

        let listHistories = [];
        for (let i = 0; i < response.length; i++) {
            let { id, linkImage, time } = response[i];
            let user = await CRUDService.getUserInfoById(response[i].userId);
            let userAccount = user.account ? user.account : 'Unkown';
            let diseaseName = response[i].predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = response[i].predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let diseaseId = response[i].predictionData?.Disease?.id || 'Unknown';
            listHistories.push({ id, linkImage, time, userAccount, diseaseName, keyDiseaseName, diseaseId });
        }
        res.render('histories/manage-histories.ejs', {
            totalRecords: countHistory,
            totalPages: totalPages,
            currentPage: parseInt(pageNumber),
            pageSize: pageSize,
            histories: listHistories,
        });
        // res.send({
        //     totalRecords: countHistory,
        //     totalPages: totalPages,
        //     currentPage: parseInt(pageNumber),
        //     pageSize: pageSize,
        //     histories: listHistories,
        // });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch sử:', error);
        return res.status(500).send({ message: 'Lỗi máy chủ nội bộ' });
    }
};

let deleteHistory = async (req, res) => {
    let id = req.query.historyId;
    let currentPage = req.query.currentPage;

    let history = await db.History.findOne({
        where: { id: id },
        attributes: ['linkImage'],
    });
    if (!history) {
        return res.status(404).send({ message: 'Không tìm thấy lịch sử' });
    } else {
        // Xoá trên db(history và ảnh)
        await historyService.deleteHistory(id, history.linkImage);

        const pageSize = 10; // Set the desired page size
        const countHistory = await historyService.countHistory();
        const totalPages = Math.ceil(countHistory / pageSize);
        if (totalPages < currentPage) {
            currentPage = totalPages;
        }
        const start = totalPages === 0 ? 0 : (currentPage - 1) * pageSize;

        const result = await historyService.getAllHistoriesForPage(start, pageSize);
        let listHistories = [];
        for (let i = 0; i < result.length; i++) {
            let { id, linkImage, time } = result[i];
            let user = await CRUDService.getUserInfoById(result[i].userId);
            let userAccount = user.account ? user.account : 'Unkown';
            let diseaseName = result[i].predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = result[i].predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let diseaseId = result[i].predictionData?.Disease?.id || 'Unknown';
            listHistories.push({ id, linkImage, time, userAccount, diseaseName, keyDiseaseName, diseaseId });
        }

        res.render('histories/manage-histories.ejs', {
            totalRecords: countHistory,
            totalPages: totalPages,
            currentPage: parseInt(currentPage),
            pageSize: pageSize,
            histories: listHistories,
        });
    }
};
let getDetailHistory = async (req, res) => {
    const id = req.query.historyId;
    let history = await db.History.findOne({
        where: { id: id },
        attributes: {
            exclude: ['updatedAt', 'createdAt'],
        },
    });
    // console.log('history = ', history);
    let predictionData = await db.Prediction.findAll({
        where: { historyId: history.id },
        attributes: {
            exclude: ['id', 'orderNumber', 'historyId', 'updatedAt', 'createdAt'],
        },
    });
    // await predictionData.map(async (prediction) => {
    //     let disease = await db.Disease.findOne({
    //         where: { id: prediction.diseaseId },
    //         attributes: ['diseaseName'],
    //     });
    //     prediction.name = disease.diseaseName;
    // });
    predictionData = await Promise.all(
        predictionData.map(async (prediction) => {
            let disease = await db.Disease.findOne({
                where: { id: prediction.diseaseId },
                attributes: ['diseaseName', 'keyDiseaseName'],
            });
            prediction.name = await i18nUtils.translate('vi', disease.keyDiseaseName);
            return prediction;
        }),
    );
    let diseaseData = await db.Disease.findOne({
        where: { id: predictionData[0].diseaseId },
        attributes: {
            exclude: ['id', 'updatedAt', 'createdAt'],
        },
    });
    diseaseData.enName = i18nUtils.translate('en', diseaseData.keyDiseaseName);
    diseaseData.viName = i18nUtils.translate('vi', diseaseData.keyDiseaseName);
    let imageDatas = await db.LinkImage.findAll({
        where: {
            diseaseId: predictionData[0].diseaseId,
        },
        attributes: {
            exclude: ['id', 'diseaseId', 'updatedAt', 'createdAt'],
        },
        raw: true,
    });

    diseaseData.imageData = imageDatas;
    // console.log('predictionData: ', predictionData);
    // console.log('history: ', history);
    // console.log('diseaseData: ', diseaseData);

    // Tắt caching bằng cách thiết lập các headers thích hợp
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send({
        listDiseases: predictionData,
        highestProbDisease: diseaseData,
        urlImageSelectedDisease: history.linkImage,
        time: dateUtils.formatTimestampToDate3(parseInt(history.time)),
    });
};

let deleteHistoryFromAndroid = async (req, res) => {
    try {
        const id = req.query.historyId;
        console.log('id: ', id);
        let history = await db.History.findOne({
            where: { id: id },
            attributes: ['linkImage'],
        });
        // console.log('history: ', history);
        if (!history) {
            return res.status(404).send({ message: 'Lỗi không tìm thấy ảnh bệnh trong lịch sử' });
        }
        await historyService.deleteHistory(id, history.linkImage);
        return res.status(200).json({ message: 'Xoá lịch sử thành công!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Xoá lịch sử thất bại!' });
    }
};
module.exports = {
    getDataHistoryComponent,
    getDataForAllHistoriesPage,
    getManageHistoryPage,
    deleteHistory,
    getDetailHistory,
    deleteHistoryFromAndroid,
};
