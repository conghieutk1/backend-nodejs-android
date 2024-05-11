import db from '../models/index';
import user from '../models/user';
import CRUDService from '../services/CRUDService';
import Toastify from 'toastify-js';
let getHomePage = async (req, res) => {
    try {
        // let data = await db.User.findAll();
        return res.render('homepage.ejs', {
            data: JSON.stringify(data),
        });
    } catch (e) {
        console.log(e);
    }
};

let getSignUp = (req, res) => {
    return res.render('auth/signup.ejs', { conflictError: '' });
};
let signUpANewUser = async (req, res) => {
    req.body.role = 'Admin';
    // console.log(req.body);
    let response = await CRUDService.createNewUser(req.body);
    console.log(response);

    // return  res.render('auth/login.ejs', { conflictError: 'response.errMessage'});
    if (response && response.errCode !== 0) {
        // alert(response.errMessage);
        return res.redirect('/sign-up');
    } else {
        // console.log('reder login ');
        return res.render('auth/login.ejs', { messageFromSignUp: response.errMessage });
    }
};
let getRecoverPassword = (req, res) => {
    return res.render('auth/fogotPassword.ejs');
};
let postCRUD = async (req, res) => {
    // console.log(req.body);
    let response = await CRUDService.createNewUser(req.body);
    console.log(response);
    let listAllUsers = await CRUDService.getAllUser();
    return res.render('users/manage-users.ejs', { message: response.errMessage, listAllUsers });
};

let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('-------------------------------------');
    console.log(data);
    console.log('-------------------------------------');

    return res.render('displayCRUD.ejs', {
        dataTable: data,
    });
};

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        // check user data not found

        return res.render('editCRUD.ejs', {
            user: userData,
        });
    } else {
        return res.send('User not found');
    }
};

let putCRUD = async (req, res) => {
    let data = req.body;
    let message = await CRUDService.updateUserData(data);

    // return res.render(let listAllUsers = await CRUDService.getAllUser();
    let listAllUsers = await CRUDService.getAllUser();
    return res.render('users/manage-users.ejs', { message: message, listAllUsers });
};

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {
        let message = await CRUDService.deleteUserById(id);
        let listAllUsers = await CRUDService.getAllUser();
        return res.render('users/manage-users.ejs', { message: message, listAllUsers });
    } else {
        let listAllUsers = await CRUDService.getAllUser();
        return res.render('users/manage-users.ejs', { message: 'User not found', listAllUsers });
    }
};
let testAPI = (req, res) => {
    let imageData = req.body.test;
    // let decodedImageData = Buffer.from(imageData, 'base64');
    console.log('decodedImageData = ', imageData);
    let message = {
        errorCode: 0,
        errMessage: 'OK',
    };
    return res.send(message);
};
module.exports = {
    testAPI: testAPI,
    getRecoverPassword: getRecoverPassword,
    signUpANewUser: signUpANewUser,
    getHomePage: getHomePage,
    getSignUp: getSignUp,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
};
