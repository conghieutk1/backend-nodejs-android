import db from '../models/index';
require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/connectS3AWS');

function saveBase64Image(base64String, folderPath, fileName) {
    // Decode base64 string into buffer
    const imageBuffer = Buffer.from(base64String, 'base64');
    // Create directory if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    // Create path for the new image file
    const filePath = path.join(folderPath, fileName);
    // Write buffer to file
    fs.writeFileSync(filePath, imageBuffer);
    return filePath;
}
function deleteFile(filePath) {
    try {
        // Kiểm tra xem tệp có tồn tại không
        if (fs.existsSync(filePath)) {
            // Xóa tệp
            fs.unlinkSync(filePath);
            console.log(`File tại ${filePath} đã được xóa.`);
        } else {
            console.log(`File tại ${filePath} không tồn tại.`);
        }
    } catch (err) {
        console.error(`Lỗi khi xóa file tại ${filePath}:`, err);
    }
}

let getDataPredictFromPythonServer = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const base64String = data.base64FromAndroid;
            const userId = data.userId;

            if (!base64String) {
                resolve({
                    errorCode: 1,
                    errMessage: 'Không tìm thấy file ảnh',
                    listDiseases: [],
                });
            }

            const folderPath = './src/public/test'; // Folder path within your project

            const tempName = new Date().getTime();
            const fileName = 'image' + tempName + '.jpg'; // File name for the saved image

            const savedImagePath = saveBase64Image(base64String, folderPath, fileName);
            console.log('Ảnh đã được lưu tại:', savedImagePath);

            const formData = new FormData();
            formData.append('file', fs.createReadStream(savedImagePath));

            const apiUrl = 'http://localhost:8000/classify/predict';

            const response = await axios.post(apiUrl, formData, {
                headers: {
                    ...formData.getHeaders(), // Bắt buộc phải thêm header 'Content-Type' để chỉ định định dạng của dữ liệu form-data
                },
            });
            // console.log('response', response.statusText);
            let tempdiseaseId;
            if (response.statusText == 'OK' && response.status == 200) {
                let predictResult = response.data.data;
                console.log('Tải file ảnh lên Discord(Server AI) thành công.');
                deleteFile(savedImagePath);
                //Tạo history bằng service
                const fileName = `${new Date().getTime()}`;
                const url =
                    'https://' +
                    process.env.AWS_S3_BUCKET_NAME +
                    '.s3.' +
                    process.env.AWS_REGION +
                    '.amazonaws.com/history/' +
                    userId +
                    '/' +
                    fileName;
                const history = await db.History.create({
                    userId: userId, //typo
                    image: base64String,
                    time: fileName,
                    linkImage: url,
                });
                const predictions = predictResult.map(async (predict, i) => {
                    let diseaseId = await getDiseaseIdByKeyName(predict.name);
                    if (i === 0) tempdiseaseId = diseaseId;
                    return {
                        diseaseId: diseaseId,
                        orderNumber: i + 1,
                        probability: predict.prob,
                        historyId: history.dataValues.id,
                    };
                });

                const predictionData = await Promise.all(predictions);

                await db.Prediction.bulkCreate(predictionData);

                // Lấy dữ liệu bệnh có xác suất cao nhất
                let dataDisease = await db.Disease.findOne({
                    where: {
                        id: tempdiseaseId,
                    },
                    attributes: {
                        exclude: ['id', 'createdAt', 'updatedAt'],
                    },
                });

                const params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `history/${userId}/${fileName}`,
                    ContentType: 'image/jpeg',
                };

                const command = new PutObjectCommand(params);
                const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL hết hạn sau 60 giây

                console.log('All predictions have been created successfully.');
                resolve({
                    errorCode: 0,
                    errMessage: 'OK',
                    listDiseases: predictResult,
                    highestProbDisease: dataDisease,
                    presignedUrl: presignedUrl,
                });
            } else {
                console.error('Có lỗi khi tải ảnh lên server AI:', error);
                reject({
                    errorCode: 2,
                    errMessage: 'Có lỗi khi tải ảnh lên server AI',
                    listDiseases: [],
                });
            }
        } catch (e) {
            reject({
                errorCode: 3,
                errMessage: 'Có lỗi khi tại server nodejs',
                listDiseases: [],
            });
        }
    });
};
let getDiseaseIdByKeyName = (keyName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let disease = await db.Disease.findOne({
                where: { keyDiseaseName: keyName },
            });
            if (disease) {
                resolve(disease.id);
            } else {
                resolve(-1);
            }
        } catch (e) {
            reject(e);
        }
    });
};
let checkDiseaseByKey = (keyName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let disease = await db.Disease.findOne({
                where: { keyDiseaseName: keyName },
            });
            if (disease) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    getDataPredictFromPythonServer: getDataPredictFromPythonServer,
};
