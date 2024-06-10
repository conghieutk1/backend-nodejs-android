import e from 'cors';
import CRUDService from '../services/CRUDService';

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
};
