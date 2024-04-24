// const User = require('../../models/user.model');
import bcrypt from 'bcryptjs';
import db from '../../models/index';
// import user from '../../models/user';
import CRUDService from '../../services/CRUDService';
import userService from '../../services/userService';
const baseUrl = 'http://localhost:8081';
exports.showLoginForm = (req, res) => {
    res.render('login.ejs');
};

exports.login = async (req, res) => {
    const { account, password } = req.body;

    if (account && password) {
        if (account == '' || password == '') {
            const conflictError = '';
            res.render('login.ejs', { account, password, conflictError, baseUrl });
        }
        let isExist = await checkUserAccount(account);
        if (!isExist) {
            // res.redirect('/login');
            const conflictError = 'Người dùng không tồn tại';
            res.render('login.ejs', { account, password, conflictError, baseUrl });
        } else {
            let user = await db.User.findOne({
                attributes: ['id', 'account', 'password', 'role'],
                where: { account: account },
                raw: true,
            });
            if (user) {
                let check = await bcrypt.compare(password, user.password);
                if (check) {
                    req.session.loggedin = true;
                    req.session.user = user;
                    res.redirect('/manage-system');
                } else {
                    const conflictError = 'Mật khẩu không đúng';
                    res.render('login.ejs', { account, password, conflictError, baseUrl });
                }
            }
        }
    } else {
        // A user with that account address does not exists
        const conflictError = '';
        res.render('login.ejs', { account, password, conflictError, baseUrl });
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
        res.redirect('/');
    });
};
