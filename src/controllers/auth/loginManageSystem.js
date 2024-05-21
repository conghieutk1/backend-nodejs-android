// const User = require('../../models/user.model');
import bcrypt from 'bcryptjs';
import db from '../../models/index';
// import user from '../../models/user';
// import CRUDService from '../../services/CRUDService';
// import userService from '../../services/userService';

exports.showLoginForm = (req, res) => {
    res.render('login.ejs');
};

exports.login = async (req, res) => {
    const { account, password } = req.body;

    if (account && password) {
        if (account == '' || password == '') {
            const conflictError = '';
            res.render('auth/login.ejs', { account, password, conflictError, messageFromSignUp: '' });
        }
        let isExist = await checkUserAccount(account);
        if (!isExist) {
            // res.redirect('/login');
            const conflictError = 'User does not exist';
            res.render('auth/login.ejs', { account, password, conflictError, messageFromSignUp: '' });
        } else {
            let user = await db.User.findOne({
                attributes: ['id', 'account', 'password', 'role'],
                where: { account: account },
                raw: true,
            });
            if (user && user.role === 'User') {
                const conflictError = 'This page is for administrators only';
                res.render('auth/login.ejs', { account, password, conflictError, messageFromSignUp: '' });
            }
            if (user && user.role === 'Admin') {
                let check = await bcrypt.compare(password, user.password);
                if (check) {
                    req.session.loggedin = true;
                    // user = {
                    //     password: '',
                    //     ...user,
                    // }
                    delete user.password;
                    req.session.user = user;
                    res.redirect('/manage-system/dashboard');
                    // console.log('req.session: ', req.session);
                } else {
                    const conflictError = 'Incorrect password';
                    res.render('auth/login.ejs', { account, password, conflictError, messageFromSignUp: '' });
                }
            }
        }
    } else {
        // A user with that account address does not exists
        const conflictError = '';
        res.render('auth/login.ejs', { account, password, conflictError, messageFromSignUp: '' });
    }
};
let checkUserAccount = (userAccount) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { account: userAccount },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) res.redirect('/500');
        res.redirect('/login');
        // console.log('req.session: ', req.session);
    });
};
