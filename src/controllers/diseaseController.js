import diseaseService from '../services/diseaseService';
import db from '../models/index';
require('dotenv').config();

let createNewDisease = async (req, res) => {
    let response = await diseaseService.createNewDiseaseByService(req.body);
    return res.render('diseases/add-diseases.ejs', {
        message: response.errMessage,
        errCode: response.errCode,
        redirectUrl: '/manage-system/add-diseases',
    });
};
let getUpdateDiseasePage = async (req, res) => {
    let id = req.query.id;
    if (id) {
        let response = await diseaseService.getDetailDiseaseMarkdownById(id);
        if (response) {
            return res.render('diseases/edit-diseases.ejs', {
                detailDiseaseData: response, // Truyền đối tượng trực tiếp
            });
            // return res.send(response);
        }
    }
    return res.send('Error occured!!!');
};
let updateDisease = async (req, res) => {
    let data = req.body;
    let response = await diseaseService.updateDisease(data);
    let listAllDiseases = await diseaseService.getAllDiseases();
    return res.render('diseases/manage-diseases.ejs', {
        message: response.errMessage,
        errCode: response.errCode,
        listAllDiseases,
    });
};
let deleteDisease = async (req, res) => {
    let id = req.query.id;
    if (id) {
        let response = await diseaseService.deleteDisease(id);
        let listAllDiseases = await diseaseService.getAllDiseases();
        return res.render('diseases/manage-diseases.ejs', {
            message: response.errMessage,
            errCode: response.errCode,
            listAllDiseases,
        });
    }
};
let generatePresignedUrl = async (req, res) => {
    let dataFileUpload = req.query;
    const id = dataFileUpload.diseaseId; // Lấy diseaseId từ request URL hoặc từ req.body tùy thuộc vào cách bạn thiết kế API
    console.log('dataFileUpload ', dataFileUpload);
    try {
        const response = await diseaseService.getPresignedUrlFromS3(dataFileUpload);
        if (response.err) {
            return res.status(500).send({ err: 'An error occurred!!!' });
        }

        // Lưu URL vào cơ sở dữ liệu
        const url =
            'https://' +
            process.env.AWS_S3_BUCKET_NAME +
            '.s3.' +
            process.env.AWS_REGION +
            '.amazonaws.com/uploads/' +
            id +
            '/' +
            response.fileName;
        console.log('url: ', url);

        await db.LinkImage.create({
            diseaseId: id,
            linkImage: url,
        });

        console.log('Upload successfully!!!');
        return res.send({ url: response.url });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ err: 'An error occurred!' });
    }
};

let getListDiseaseForView = async (req, res) => {
    // let id = req.query.id;
    // if (!id) {
    //     return res.status(200).json({
    //         errCode: 1,
    //         errMessage: 'Missing required parameter',
    //         diseases: [],
    //     });
    // }
    let response = await diseaseService.getAllDiseases();
    // console.log('response ', response);
    // let diseasesArray = response.diseases;
    let diseasesData = [];
    for (let i = 0; i < response.length; i++) {
        diseasesData.push({
            diseaseName: response[i].diseaseName,
            imageData: response[i].imageData,
        });
    }
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        diseasesData,
    });
};
let getDetailInformationDisease = async (req, res) => {
    let diseaseId = req.query.diseaseId;
    if (!diseaseId) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            diseases: [],
        });
    }
    let response = await diseaseService.getDetailDiseaseMarkdownById(diseaseId);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        detailDiseaseData: response,
    });
};
let deleteImage = async (req, res) => {
    const { imageUrl, diseaseId } = req.body;

    try {
        await diseaseService.deleteImageFromS3(imageUrl);
        // res.redirect('/get-update-disease-page?id=' + diseaseId);
        res.status(200).json({ redirectUrl: '/get-update-disease-page?id=' + diseaseId });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Failed to delete image' });
    }
};

let getManageDiseasesPage = async (req, res) => {
    try {
        let listAllDiseases = await diseaseService.getAllDiseases();
        return res.render('diseases/manage-diseases.ejs', { message: '', errCode: 0, listAllDiseases });
    } catch (e) {
        return res.status(200).send('Error get listAllDiseases from getManageDiseasesPage');
    }
};

let getAddNewDiseasePage = async (req, res) => {
    return res.render('diseases/add-diseases.ejs', {
        message: '',
        errCode: 0,
    });
};
module.exports = {
    createNewDisease: createNewDisease,
    deleteDisease: deleteDisease,
    getUpdateDiseasePage: getUpdateDiseasePage,
    updateDisease: updateDisease,
    generatePresignedUrl: generatePresignedUrl,
    getListDiseaseForView: getListDiseaseForView,
    getDetailInformationDisease: getDetailInformationDisease,
    deleteImage: deleteImage,
    getManageDiseasesPage,
    getAddNewDiseasePage,
};
