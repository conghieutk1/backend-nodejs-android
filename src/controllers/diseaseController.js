import diseaseService from '../services/diseaseService';

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
        let detailDiseaseData = response.diseaseData;
        return res.render('diseases/edit-diseases.ejs', {
            detailDiseaseData, // Truyền đối tượng trực tiếp
        });
        // return res.render('diseases/edit-diseases.ejs', JSON.stringify(detailDiseaseData));
    }
    return res.send('Error occured!!!');
};
let updateDisease = async (req, res) => {
    let data = req.body;
    let response = await diseaseService.updateDisease(data);
    console.log('response ', response);
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

module.exports = {
    createNewDisease: createNewDisease,
    deleteDisease: deleteDisease,
    getUpdateDiseasePage: getUpdateDiseasePage,
    updateDisease: updateDisease,
};
