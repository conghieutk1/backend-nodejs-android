import express from 'express';
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
import cameraController from '../controllers/cameraController';
import eventController from '../controllers/eventController';
// import doctorController from '../controllers/doctorController';
// import patientController from '../controllers/patientController';
const login = require('../controllers/auth/loginManageSystem');
const authMiddleware = require('../middleware/auth');
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.displayGetCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.post('/put-crud', homeController.putCRUD);
    router.get('/delete-crud', homeController.deleteCRUD);

    // test
    router.get('/login', authMiddleware.isAuth, login.login);
    router.get('/manage-system', authMiddleware.loggedin, (req, res) => {
        res.render('backend/index.ejs');
    });
    router.post('/login', login.login);
    // api
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/allcode', userController.GetAllCode);

    // camera api
    router.post('/api/create-list-camera-from-server', cameraController.handleCreateListCameraFromServer);
    router.get('/api/get-all-cameras', cameraController.handleGetAllCameras);

    // event api
    router.post('/api/create-new-event', eventController.handleCreateNewEvent);
    router.get('/api/get-all-events', eventController.handleGetAllEvents);
    return app.use('/', router);
};

module.exports = initWebRoutes;
