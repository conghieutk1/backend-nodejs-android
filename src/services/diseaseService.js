import db from '../models/index';
require('dotenv').config();
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/connectS3AWS');

let createNewDiseaseByService = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExist = await checkDiseaseByKey(data.keyName);
            if (isExist === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'This disease is already in used, detail is key name',
                });
            } else {
                await db.Disease.create({
                    diseaseName: data.diseaseName,
                    keyDiseaseName: data.keyName,
                    symtomMarkdown: data.symbol, //typo
                    precautionMarkdown: data.precaution,
                    reasonMarkdown: data.reason,
                    treatmentMarkdown: data.treatment,
                    descriptionMarkdown: data.description,
                });
                resolve({
                    errCode: 0,
                    errMessage: 'Create a disease succeedfully!',
                });
            }
        } catch (e) {
            reject({
                errCode: 2,
                errMessage: 'An error occured!',
            });
        }
    });
};
let getAllDiseases = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let diseases = await db.Disease.findAll({
                raw: true,
            });
            resolve(diseases);
        } catch (e) {
            reject(e);
        }
    });
};
let getDetailDiseaseMarkdownById = async (diseaseId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let diseaseData = await db.Disease.findOne({
                where: {
                    id: diseaseId,
                },
                raw: true,
                nest: true,
            });
            if (diseaseData) {
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    diseaseData: diseaseData,
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Failded',
                });
            }
        } catch (e) {
            reject({
                errCode: 0,
                errMessage: 'An error occured!',
            });
        }
    });
};
let updateDisease = (updateData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let disease = await db.Disease.findOne({
                where: {
                    id: updateData.diseaseId,
                },
                raw: false,
            });
            if (disease) {
                disease.diseaseName = updateData.diseaseName;
                disease.keyDiseaseName = updateData.keyName;
                disease.symtomMarkdown = updateData.symbol;
                disease.precautionMarkdown = updateData.precaution;
                disease.reasonMarkdown = updateData.reason;
                disease.treatmentMarkdown = updateData.treatment;
                disease.descriptionMarkdown = updateData.description;
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Update disease failed!',
                });
            }

            await disease.save();
            resolve({
                errCode: 0,
                errMessage: 'Update user succeedfully!',
            });
        } catch (e) {
            reject({
                errCode: 2,
                errMessage: 'An error occured!',
            });
        }
    });
};
let deleteDisease = (diseaseId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let disease = await db.Disease.findOne({
                where: { id: diseaseId },
                raw: false,
            });
            if (disease) {
                await disease.destroy();
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Delete disease failed!',
                });
            }

            resolve({
                errCode: 0,
                errMessage: 'Delete disease succeedfully!',
            });
        } catch (e) {
            reject({
                errCode: 2,
                errMessage: 'An error occured!',
            });
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

let getPresignedUrlFromS3 = (dataFileUpload) => {
    return new Promise(async (resolve, reject) => {
        const fileName = `${new Date().getTime()}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `uploads/${dataFileUpload.diseaseId}/${fileName}`,
            ContentType: dataFileUpload.fileType,
        };
        try {
            const command = new PutObjectCommand(params);
            const url = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL hết hạn sau 60 giây
            resolve({
                url: url,
                fileName: fileName,
                err: null,
            });
        } catch (err) {
            reject({
                url: '',
                fileName: null,
                err: err,
            });
        }
    });
};
module.exports = {
    createNewDiseaseByService: createNewDiseaseByService,
    getAllDiseases: getAllDiseases,
    getDetailDiseaseMarkdownById: getDetailDiseaseMarkdownById,
    updateDisease: updateDisease,
    deleteDisease: deleteDisease,
    getPresignedUrlFromS3: getPresignedUrlFromS3,
};
