import bcrypt from 'bcryptjs';
import db from '../../models/index';
import auth from '../../config/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import dateUtils from '../../utils/dateUtils.js';

exports.showLoginForm = (req, res) => {
    res.render('login.ejs');
};

exports.getLoginPage = async (req, res) => {
    return res.render('auth/login.ejs');
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
exports.handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        let response = await signInWithEmailAndPassword(auth, email, password);
        // console.log('response', response);
        const user = {
            email: response.user.email,
            phoneNumber: response.user.phoneNumber,
            displayName: response.user.displayName ? response.user.displayName : 'Hiếu Đặng',
            photoURL: response.user.photoURL
                ? response.user.photoURL
                : 'https://lh3.googleusercontent.com/a/ACg8ocLUJU8nlYbmQssmeIidWWMgjuMQpmO-l3wl7HMEeayP0O1UrWnf=s96-c',
            accessToken: response.user.stsTokenManager.accessToken,
            expirationTime: dateUtils.formatTimestampToDate3(response.user.stsTokenManager.expirationTime),
        };
        req.session.loggedin = true;
        req.session.user = user;
        return res.status(200).json({
            errCode: 0,
            errMessage: 'Login successfully',
            user: user,
        });
    } catch (error) {
        console.log('error: ', error);
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
            res.status(401).json({
                errCode: 1,
                errMessage: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
            });
        } else if (errorCode === 'auth/too-many-requests') {
            res.status(401).json({
                errCode: 1,
                errMessage: 'Số lần đăng nhập không thành công của bạn đã vượt quá giới hạn. Vui lòng thử lại sau.',
            });
        } else {
            res.status(500).json({
                errCode: 2,
                errMessage: 'Lỗi xác thực. Vui lòng thử lại sau',
            });
        }
    }
};
exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error('Error logging out:', err);
            res.redirect('/500'); // Điều hướng đến trang lỗi nếu có lỗi xảy ra
            return;
        }

        // Sau khi đăng xuất thành công từ cấu trúc phiên của Express,
        // tiến hành xóa phiên làm việc của người dùng từ cấu trúc phiên của Google OAuth
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.redirect('/500'); // Điều hướng đến trang lỗi nếu có lỗi xảy ra
                return;
            }
            // Điều hướng đến trang đăng nhập sau khi đăng xuất thành công
            // res.redirect('https://accounts.google.com/logout');
            res.redirect('/login');
        });
        console.log('Logged out successfully');
    });
};
