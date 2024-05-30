import db from '../models/index';
require('dotenv').config();
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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
                attributes: {
                    exclude: ['updatedAt', 'createdAt'],
                },
            });
            if (diseases) {
                for (let i = 0; i < diseases.length; i++) {
                    let imageDatas = await db.LinkImage.findAll({
                        where: {
                            diseaseId: diseases[i].id,
                        },
                        attributes: {
                            exclude: ['id', 'diseaseId', 'updatedAt', 'createdAt'],
                        },
                        raw: true,
                    });
                    diseases[i].imageData = imageDatas;
                }

                resolve(diseases);
            } else {
                resolve([]);
            }
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
                attributes: {
                    exclude: ['updatedAt', 'createdAt'],
                },
                raw: true,
                nest: true,
            });

            if (diseaseData) {
                let imageDatas = await db.LinkImage.findAll({
                    where: {
                        diseaseId: diseaseId,
                    },
                    attributes: {
                        exclude: ['id', 'diseaseId', 'updatedAt', 'createdAt'],
                    },
                    raw: true,
                });

                diseaseData.imageData = imageDatas;
                resolve(diseaseData);
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
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

let deleteImageFromS3 = async (imageUrl) => {
    try {
        // Phân tích URL để lấy bucket name và key
        const url = new URL(imageUrl);
        const bucketName = url.hostname.split('.')[0]; // Lấy bucket name từ hostname
        const key = url.pathname.substring(1); // Lấy key từ pathname
        try {
            const deleteParams = {
                Bucket: bucketName,
                Key: key,
            };
            // delete in aws s3
            const command = new DeleteObjectCommand(deleteParams);
            await s3Client.send(command);
            // delete in database
            let image = await db.LinkImage.findOne({
                where: { linkImage: imageUrl },
                raw: false,
            });
            if (image) {
                await image.destroy();
            }
            console.log(`File deleted successfully: ${key}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    } catch (e) {
        console.log('e');
    }
};
module.exports = {
    createNewDiseaseByService,
    getAllDiseases,
    getDetailDiseaseMarkdownById,
    updateDisease,
    deleteDisease,
    getPresignedUrlFromS3,
    deleteImageFromS3,
};
