import db from '../models/index';
require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/connectS3AWS');
import i18nUtils from '../utils/language/i18nUtils';

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

const MAX_IMAGE_SIZE_BYTES = 10000000; // 10 MB

async function getDataPredictFromPythonServer1(data) {
    const { base64FromAndroid, userId } = data;
    if (!base64FromAndroid) {
        return {
            errorCode: 1,
            errMessage: 'No image found',
            listDiseases: [],
        };
    }

    const imageBuffer = Buffer.from(base64FromAndroid, 'base64');
    if (imageBuffer.length > MAX_IMAGE_SIZE_BYTES) {
        return {
            errorCode: 2,
            errMessage: 'Image size exceeds limit',
            listDiseases: [],
        };
    }

    const folderPath = path.join(__dirname, '../public/test');
    const fileName = `${Date.now()}.jpg`;
    const savedImagePath = saveBase64Image(base64FromAndroid, folderPath, fileName);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(savedImagePath));

    const apiUrl = 'http://localhost:8000/classify/predict';

    const response = await axios.post(apiUrl, formData, {
        headers: { ...formData.getHeaders() },
    });

    if (response.status !== 200 || response.statusText !== 'OK') {
        return {
            errorCode: 3,
            errMessage: 'Failed to upload image to AI server',
            listDiseases: [],
        };
    }

    const predictResult = response.data.data;
    deleteFile(savedImagePath);

    const history = await createHistory(userId, fileName);
    const predictionData = await createPredictions(predictResult, history.id);

    await db.Prediction.bulkCreate(predictionData);
    const highestProbDisease = await getHighestProbDisease(predictionData);
    const presignedUrl = await createPresignedUrl(userId, fileName);

    return {
        errorCode: 0,
        errMessage: 'OK',
        listDiseases: predictResult,
        highestProbDisease,
        presignedUrl,
        urlImageSelectedDisease: history.linkImage,
    };
}

async function createHistory(userId, fileName) {
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/history/${userId}/${fileName}`;
    return await db.History.create({ userId, time: fileName, linkImage: url });
}

async function createPredictions(predictResult, historyId) {
    return await Promise.all(
        predictResult.map(async (predict, i) => {
            const diseaseId = await getDiseaseIdByKeyName(predict.name);
            return {
                diseaseId,
                orderNumber: i + 1,
                probability: predict.prob,
                historyId,
            };
        }),
    );
}

async function getHighestProbDisease(predictionData) {
    const highestProbDisease = predictionData.reduce((max, curr) => {
        return curr.prob > max.prob ? curr : max;
    });
    highestProbDisease.enName = await i18nUtils.translate('en', highestProbDisease.diseaseNameKey);
    highestProbDisease.viName = await i18nUtils.translate('vi', highestProbDisease.diseaseNameKey);
    highestProbDisease.imageData = await db.LinkImage.findAll({
        where: {
            diseaseId: highestProbDisease.diseaseId,
        },
        attributes: { exclude: ['id', 'diseaseId', 'updatedAt', 'createdAt'] },
        raw: true,
    });
    return highestProbDisease;
}

async function createPresignedUrl(userId, fileName) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `history/${userId}/${fileName}`,
        ContentType: 'image/jpeg',
    };
    const command = new PutObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
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
                console.log('Tải file ảnh lên aws s3 thành công.');
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
                    // image: base64String,
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
                dataDisease.enName = i18nUtils.translate('en', dataDisease.keyDiseaseName);
                dataDisease.viName = i18nUtils.translate('vi', dataDisease.keyDiseaseName);
                let imageDatas = await db.LinkImage.findAll({
                    where: {
                        diseaseId: tempdiseaseId,
                    },
                    attributes: {
                        exclude: ['id', 'diseaseId', 'updatedAt', 'createdAt'],
                    },
                    raw: true,
                });

                dataDisease.imageData = imageDatas;

                const params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `history/${userId}/${fileName}`,
                    ContentType: 'image/jpeg',
                };
                const command = new PutObjectCommand(params);
                const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL hết hạn sau 300 giây

                // console.log('All predictions have been created successfully.');
                // console.log('presignedUrl = ', presignedUrl);
                resolve({
                    errorCode: 0,
                    errMessage: 'OK',
                    listDiseases: predictResult,
                    highestProbDisease: dataDisease,
                    presignedUrl: presignedUrl,
                    urlImageSelectedDisease: url,
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
