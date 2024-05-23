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
                let markdown = await db.Markdown.create({
                    symtomMarkdown: data.symbol, //typo
                    precautionMarkdown: data.precaution,
                    reasonMarkdown: data.reason,
                    treatmentMarkdown: data.treatment,
                    descriptionMarkdown: data.description,
                });
                // console.log('mardown ', mardown);
                // console.log('mardownID = ', mardown.dataValues.id);
                const markdownId = markdown.dataValues.id;
                await db.Disease.create({
                    diseaseName: data.diseaseName,
                    keyDiseaseName: data.keyName,
                    markdownId: markdownId,
                });

                resolve({
                    errCode: 0,
                    errMessage: 'Create a disease succeedfully!',
                });
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
    createNewDiseaseByService: createNewDiseaseByService,
};
