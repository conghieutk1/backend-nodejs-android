import db from '../models/index';

let createNewDiseaseByService = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('data =', data);
            let isExist = await checkDiseaseByKey(data.keyName);
            if (isExist === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'This disease is already in used, detail is key name',
                });
            } else {
                const disease = await db.Disease.create({
                    diseaseName: data.diseaseName,
                    keyDiseaseName: data.keyName,
                });
                await db.Markdown.create({
                    diseaseId: disease.dataValues.id,
                    symtomMarkdown: data.symbol, //typo
                    precautionMarkdown: data.precaution,
                    reasonMarkdown: data.reason,
                    treatmentMarkdown: data.treatment,
                    descriptionMarkdown: data.description,
                });
                // console.log('mardown ', mardown);
                // console.log('mardownID = ', mardown.dataValues.id);
                // const markdownId = markdown.dataValues.id;
                // await db.Disease.create({
                //     diseaseName: data.diseaseName,
                //     keyDiseaseName: data.keyName,
                //     markdownId: markdownId,
                // });

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
                include: [
                    {
                        model: db.Markdown,
                        attributes: [
                            'symtomMarkdown',
                            'precautionMarkdown',
                            'reasonMarkdown',
                            'treatmentMarkdown',
                            'descriptionMarkdown',
                        ],
                    },
                ],
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
            //
            console.log('updateData = ', updateData);
            let disease = await db.Disease.findOne({
                where: {
                    id: updateData.diseaseId,
                },
                raw: false,
            });
            if (disease) {
                disease.diseaseName = updateData.diseaseName;
                disease.keyDiseaseName = updateData.keyName;
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Update disease failed!',
                });
            }
            let mardown = await db.Markdown.findOne({
                where: {
                    diseaseId: updateData.diseaseId,
                },
                raw: false,
            });
            if (mardown) {
                mardown.symtomMarkdown = updateData.symbol;
                mardown.precautionMarkdown = updateData.precaution;
                mardown.reasonMarkdown = updateData.reason;
                mardown.treatmentMarkdown = updateData.treatment;
                mardown.descriptionMarkdown = updateData.description;
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Update disease failed!',
                });
            }

            await disease.save();
            await mardown.save();
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
module.exports = {
    createNewDiseaseByService: createNewDiseaseByService,
    getAllDiseases: getAllDiseases,
    getDetailDiseaseMarkdownById: getDetailDiseaseMarkdownById,
    updateDisease: updateDisease,
    deleteDisease: deleteDisease,
};
