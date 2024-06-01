import historyService from '../services/historyService';
import CRUDService from '../services/CRUDService';
require('dotenv').config();
import dateUtils from '../utils/dateUtils';

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

        let data = [];
        for (let i = 0; i < response.length; i++) {
            let { time, linkImage, predictionData } = response[i];
            let diseaseName = predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let DateTime = 'Ngày ' + dateUtils.formatTimestampToDate(parseInt(time));
            data.push({ DateTime, linkImage, diseaseName, keyDiseaseName });
        }
        return res.send({
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

        let response = await historyService.getAllHistoriesForPage(0, 10);
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
            let { time, linkImage, predictionData } = item;
            let diseaseName = predictionData?.Disease?.diseaseName || 'Unknown';
            let keyDiseaseName = predictionData?.Disease?.keyDiseaseName || 'Unknown';
            let DateTime = dateUtils.formatTimestampToDate3(parseInt(time));
            return { DateTime, linkImage, diseaseName, keyDiseaseName };
        });
        return res.send({
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
module.exports = {
    getDataHistoryComponent,
    getDataForAllHistoriesPage,
    getManageHistoryPage,
};
