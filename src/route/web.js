import express from 'express';
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
import modelAIController from '../controllers/modelAIController';
import diseaseController from '../controllers/diseaseController';
import historyController from '../controllers/historyController';
import feedbackController from '../controllers/feedbackController';
const login = require('../controllers/auth/loginManageSystem');
const authMiddleware = require('../middleware/auth');
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', authMiddleware.isAuth, login.login);

    // user
    router.post('/post-crud', homeController.postCRUD);
    router.post('/sign-up-a-new-user', homeController.signUpANewUser);
    router.get('/edit-crud', authMiddleware.loggedin, homeController.getEditCRUD);
    router.post('/put-crud', authMiddleware.loggedin, homeController.putCRUD);
    router.get('/delete-crud', authMiddleware.loggedin, homeController.deleteCRUD);

    // disease
    router.post('/create-disease', diseaseController.createNewDisease);
    router.get('/delete-disease', authMiddleware.loggedin, diseaseController.deleteDisease);
    router.get('/get-update-disease-page', diseaseController.getUpdateDiseasePage);
    router.post('/update-disease', diseaseController.updateDisease);
    router.post('/delete-image', diseaseController.deleteImage);

    // server-side
    router.get('/login', authMiddleware.isAuth, login.login);
    router.post('/login', login.login);
    router.get('/log-out', login.logout);
    router.get('/sign-up', homeController.getSignUp);
    router.get('/recover-password', homeController.getRecoverPassword);

    router.get('/manage-system/*', authMiddleware.loggedin);
    router.get('/manage-system/dashboard', homeController.getDashboardPage);
    router.get('/manage-system/manage-users', userController.getManageUsersPage);
    router.get('/manage-system/add-new-user', userController.getAddNewUserPage);
    router.get('/manage-system/user-profile', userController.getUserProfilePage);
    router.get('/manage-system/manage-diseases', diseaseController.getManageDiseasesPage);
    router.get('/manage-system/add-diseases', diseaseController.getAddNewDiseasePage);
    router.get('/manage-system/manage-histories', historyController.getManageHistoryPage);

    // api
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);

    // android
    router.post('/api/predict-from-android', modelAIController.getPredictDisease);
    router.get('/api/get-history-by-userId', historyController.getDataHistoryComponent);
    router.get('/api/get-all-histories-by-userId', historyController.getDataForAllHistoriesPage);
    router.get('/api/list-disease-for-view', diseaseController.getListDiseaseForView);
    router.get('/api/detail-disease-by-diseaseId', diseaseController.getDetailInformationDisease);
    router.get('/api/infomation-weather-today', modelAIController.getInfomationWeatherToday);
    router.get('/api/get-all-diseases-by-userId', diseaseController.getDataForAllDiseasesPage);
    router.get('/api/get-data-feedback', diseaseController.getDataFeedback);
    router.post('/api/send-a-feedback', feedbackController.createFeedback);
    // aws
    router.get('/generate-presigned-url', diseaseController.generatePresignedUrl);

    return app.use('/', router);
};

module.exports = initWebRoutes;
