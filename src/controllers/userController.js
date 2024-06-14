import userService from '../services/userService';
import CRUDService from '../services/CRUDService';
let handleLogin = async (req, res) => {
    let account = req.body.account;
    let password = req.body.password;

    if (!account || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!',
        });
    }

    let userData = await userService.handleUserLogin(account, password);
    //check account exist
    //password nhap vao ko dung
    //return userInfor
    // access_token :JWT json web token
    console.log('userData: ', userData);
    return res.status(200).json({
        errCode: userData.errCode,
        errMessage: userData.errMessage,
        user: userData.user ? userData.user : {},
    });
};
let handleGetAllUsers = async (req, res) => {
    let id = req.query.id;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            users: [],
        });
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users,
    });
};

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
};

let handleEditUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUser(data);
    return res.status(200).json(message);
};

let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
        });
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
};

let getManageUsersPage = async (req, res) => {
    try {
        let listAllUsers = await CRUDService.getAllUser();
        return res.render('users/manage-users.ejs', { message: '', listAllUsers });
    } catch (e) {
        return res.status(200).send('Error get listAllUsers from getManageUsersPage');
    }
};

let getAddNewUserPage = async (req, res) => {
    return res.render('users/add-users.ejs');
};

let getUserProfilePage = async (req, res) => {
    return res.render('users/user-profile.ejs');
};
let getAllUserForManageSystem = async (req, res) => {
    const { pageNumber = 1 } = req.query; // Default to page 1 if not provided
    const pageSize = 10; // Set the desired page size
    const countUsers = await userService.countUsers();
    const totalPages = Math.ceil(countUsers / pageSize);
    const start = (pageNumber - 1) * pageSize;

    const response = await userService.getAllUsersPaging(start, pageSize);
    // console.log('response = ', response);
    let users = [];
    for (let i = 0; i < response.length; i++) {
        let { id, account, fullName, gender, address, phoneNumber } = response[i];
        users.push({ id, account, fullName, gender, address, phoneNumber });
    }
    return res.status(200).json({
        totalRecords: countUsers,
        totalPages: totalPages,
        currentPage: parseInt(pageNumber),
        pageSize: pageSize,
        users: users,
    });
};
module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getManageUsersPage,
    getAddNewUserPage,
    getUserProfilePage,
    getAllUserForManageSystem,
};
