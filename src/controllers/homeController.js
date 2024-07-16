import CRUDService from '../services/CRUDService';
import historyService from '../services/historyService';
import diseaseService from '../services/diseaseService';
import feedbackService from '../services/feedbackService';
import i18nUtils from '../utils/language/i18nUtils';
let getSignUp = (req, res) => {
    return res.render('auth/signup.ejs', { conflictError: '' });
};
let signUpANewUser = async (req, res) => {
    req.body.role = 'Admin';
    let response = await CRUDService.createNewUser(req.body);
    console.log(response);

    if (response && response.errCode !== 0) {
        return res.redirect('/sign-up');
    } else {
        return res.render('auth/login.ejs', { messageFromSignUp: response.errMessage });
    }
};
let getRecoverPassword = (req, res) => {
    return res.render('auth/fogotPassword.ejs');
};
let postCRUD = async (req, res) => {
    let response = await CRUDService.createNewUser(req.body);
    console.log('createNewUser ', response);
    let listAllUsers = await CRUDService.getAllUser();
    return res.render('users/manage-users.ejs', { message: response.errMessage, listAllUsers });
};

let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('users/displayCRUD.ejs', {
        dataTable: data,
    });
};

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('users/editCRUD.ejs', {
            user: userData,
        });
    } else {
        return res.send('User not found');
    }
};

let putCRUD = async (req, res) => {
    try {
        let data = req.body;
        await CRUDService.updateUserData(data);
        return res.redirect('/manage-system/manage-users');
    } catch (err) {
        console.log('error: ', err);
    }
};

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {
        await CRUDService.deleteUserById(id);
        return res.redirect('/manage-system/manage-users');
    } else {
        return res.send('User not found');
    }
};

let getDashboardPage = async (req, res) => {
    res.render('dashboard.ejs');
};
let getDataPredictChart = async (req, res) => {
    let time = req.query.time;
    let diseases = await diseaseService.getAllKeyNameDiseases();

    let startDate;
    const currentDate = new Date();
    switch (time) {
        case 'day':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
            break;
        case 'week':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
        default:
            return reject(new Error('Invalid time period specified'));
    }
    let arrDiseaseViName = [];
    for (let i = 0; i < diseases.length; i++) {
        let diseaseName = i18nUtils.translate('vi', diseases[i].keyDiseaseName);
        arrDiseaseViName.push(diseaseName);
    }
    let dataPredict = await historyService.getAmountForDiseasesChart(diseases);
    return res.status(200).json({
        diseases: arrDiseaseViName,
        amount: dataPredict,
        total: dataPredict.reduce((a, b) => a + b, 0),
    });
};

let getDataFeedbackChart = async (req, res) => {
    let time = req.query.time;
    // let diseases = await diseaseService.getAllKeyNameDiseases();

    let startDate;
    const currentDate = new Date();
    switch (time) {
        case 'day':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
            break;
        case 'week':
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
        default:
            return reject(new Error('Invalid time period specified'));
    }
    // console.log('startDate = ', startDate);
    let dataFeedback = await feedbackService.getDataForFeedbackChart(startDate);
    return res.status(200).json(
        dataFeedback
    );
};
module.exports = {
    getRecoverPassword: getRecoverPassword,
    signUpANewUser: signUpANewUser,
    getSignUp: getSignUp,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
    getDashboardPage,
    getDataPredictChart,
    getDataFeedbackChart
};
