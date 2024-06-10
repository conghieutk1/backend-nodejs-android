import bcrypt from 'bcryptjs';
import db from '../models/index';
var salt = bcrypt.genSaltSync(10);
//const salt = bcrypt.genSaltSync(10);
import { generateUniqueSecret } from '../helpers/2fa.js';
let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('data =', data);
            let isExist = await checkUserAccount(data.account);
            if (isExist === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your account is already in used. Please try another account',
                });
            } else {
                let hashPassWordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    account: data.account,
                    password: hashPassWordFromBcrypt,
                    fullName: data.fullname,
                    phoneNumber: data.phonenumber,
                    gender: data.gender === 'Male' ? 'Male' : 'Female',
                    address: data.address,
                });

                resolve({
                    errCode: 0,
                    errMessage: 'Create a new user succeedfully!',
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            //lưu ý, truyền vào đúng password cần hash
            // let hashPassWord = await bcrypt.hashSync("B4c0/\/", salt); => copy paste mà ko edit nè
            let hashPassWord = await bcrypt.hashSync(password, salt);
            resolve(hashPassWord);
        } catch (e) {
            reject(e);
        }
    });
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

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: true,
            });

            if (user) {
                resolve(user);
            } else {
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    });
};

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                user.fullName = data.fullName;
                user.gender = data.gender;
                user.phoneNumber = data.phoneNumber;
                user.address = data.address;
                if (data.is2FAEnabled && data.is2FAEnabled === 'on') {
                    user.is2FAEnabled = true;
                    user.secret = generateUniqueSecret();
                }
                await user.save();
                resolve({
                    errCode: 0,
                    message: 'Update user succeedfully!',
                    secret: user.secret,
                });
            } else {
                resolve();
            }
        } catch (e) {
            reject('Update user failed!');
            console.log(e);
        }
    });
};

let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: false,
            });
            if (user) {
                await user.destroy();
            }

            resolve('Delete user succeedfully!');
        } catch (e) {
            reject('Delete user failed!');
        }
    });
};

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById,
};
