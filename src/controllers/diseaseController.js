import diseaseService from '../services/diseaseService';

let createNewDisease = async (req, res) => {
    console.log(req.body);
    
    let response = await diseaseService.createNewDiseaseByService(req.body);
    console.log(response);
    // let listAllUsers = await CRUDService.getAllUser();
    
    return res.render('diseases/add-diseases.ejs', {
        message: response.errMessage,
        errCode: response.errCode,
        redirectUrl: '/manage-system/add-diseases',
    });
};

module.exports = {
    createNewDisease: createNewDisease,
};
