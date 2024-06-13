import express from 'express';
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
import modelAIController from '../controllers/modelAIController';
import diseaseController from '../controllers/diseaseController';
import historyController from '../controllers/historyController';
import feedbackController from '../controllers/feedbackController';
const loginController = require('../controllers/auth/loginManageSystem');
const authMiddleware = require('../middleware/auth');
let router = express.Router();
const passport = require('passport');

let initWebRoutes = (app) => {
    router.get('/', authMiddleware.loggedin, homeController.getDashboardPage);

    // user
    router.post('/post-crud', homeController.postCRUD);
    router.post('/sign-up-a-new-user', homeController.signUpANewUser);
    router.get('/edit-crud', authMiddleware.loggedin, homeController.getEditCRUD);
    router.post('/put-crud', authMiddleware.loggedin, homeController.putCRUD);
    router.get('/delete-crud', authMiddleware.loggedin, homeController.deleteCRUD);
    router.get('/get-all-user', userController.getAllUserForManageSystem);

    // disease
    router.post('/create-disease', diseaseController.createNewDisease);
    router.get('/delete-disease', authMiddleware.loggedin, diseaseController.deleteDisease);
    router.get('/get-update-disease-page', diseaseController.getUpdateDiseasePage);
    router.post('/update-disease', diseaseController.updateDisease);
    router.post('/delete-image', diseaseController.deleteImage);

    // history
    router.get('/delete-history', historyController.deleteHistory);

    // feedback
    router.get('/get-all-feedback', feedbackController.getAllFeedbackForManageSystem);
    router.get('/delete-feedback', feedbackController.deleteFeedback);
    // router.post('/post-feedback', feedbackController.postFeedback);

    // server-side
    router.get('/login', authMiddleware.isAuth, loginController.getLoginPage);
    router.post('/auth/login', loginController.handleLogin);
    router.get('/logout', loginController.logout);
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
    router.get('/manage-system/manage-feedbacks', feedbackController.getFeedbackPage);

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
    router.get('/api/get-detail-history', historyController.getDetailHistory);
    router.delete('/api/delete-history-from-android', historyController.deleteHistoryFromAndroid);
    // aws
    router.get('/generate-presigned-url', diseaseController.generatePresignedUrl);

    // Google login
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/manage-system/dashboard');
    });
    router.get('/profile', (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
        }
        // console.log('req: ', req);
        res.send(`Hello, ${req.user.displayName}`);
    });

    // 2FA
    router.post('/auth/enable-2fa', (req, res) => {});

    return app.use('/', router);
};

module.exports = initWebRoutes;
