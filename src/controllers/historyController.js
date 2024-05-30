import historyService from '../services/historyService';
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

module.exports = {
    getDataHistoryComponent,
};
