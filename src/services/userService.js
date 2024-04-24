import db from '../models/index';
import bcrypt from 'bcryptjs';
var salt = bcrypt.genSaltSync(10);

// Định nghĩa hàm API handleUserLogin với tham số account và password
let handleUserLogin = (account, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Khởi tạo đối tượng userData để chứa kết quả trả về
            let userData = {};
            // Kiểm tra xem account có tồn tại trong hệ thống hay không
            let isExist = await checkUserAccount(account);
            if (isExist) {
                // Người dùng tồn tại trong hệ thống
                // Tìm người dùng dựa vào account từ bảng User
                let user = await db.User.findOne({
                    attributes: ['id', 'account', 'password', 'role'],
                    where: { account: account },
                    raw: true,
                });
                if (user) {
                    // So sánh mật khẩu nhập vào với mật khẩu đã lưu trong cơ sở dữ liệu
                    let check = await bcrypt.compare(password, user.password);

                    if (check) {
                        // Mật khẩu hợp lệ, trả về kết quả thành công
                        userData.errCode = 0;
                        userData.errMessage = 'OK';

                        // Xóa trường password từ đối tượng user để đảm bảo tính bảo mật
                        delete user.password;
                        // Gán thông tin người dùng vào đối tượng userData
                        userData.user = user;
                    } else {
                        // Mật khẩu không đúng
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                } else {
                    // Người dùng không tồn tại trong hệ thống
                    userData.errCode = 2;
                    userData.errMessage = `User not found`;
                }
            } else {
                // Người dùng không tồn tại trong hệ thống
                userData.errCode = 1;
                userData.errMessage = `Your's account isn't exist in our system, please try other account`;
            }
            // Trả về kết quả
            resolve(userData);
        } catch (e) {
            // Trường hợp có lỗi xảy ra trong quá trình thực hiện, trả về thông báo lỗi
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

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password'],
                    },
                    order: [['createdAt', 'ASC']],
                });
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password'],
                    },
                });
            }

            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserAccount(data.account);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage:
                        'Your account is already in used. Please try another account',
                });
            } else {
                let hashPasswordFromBcryptjs = await hashUserPassword(
                    data.password
                );
                // console.log('data.account = ' + data.account);
                await db.User.create({
                    account: data.account,
                    password: hashPasswordFromBcryptjs,
                    role: 'R2',
                });

                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
            });
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: 'The user isnt exist',
                });
            }
            if (user.role === 'R1') {
                resolve({
                    errCode: 3,
                    errMessage: 'Can not delete admin',
                });
            } else {
                await db.User.destroy({
                    where: { id: userId },
                });
                resolve({
                    errCode: 0,
                    errMessage: 'The user is deleted',
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log("id: ", data.id, " data", data);
            if (!data.id || !data.roleId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters',
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                if (data.roleId === 'R3') {
                    user.positionId = '';
                } else {
                    user.positionId = data.positionId;
                }
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                user.image = data.avatar;
                await user.save();

                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address,
                // });

                resolve({
                    errCode: 0,
                    errMessage: 'The user is updated',
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `User's not found`,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!',
                });
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getAllCodeService: getAllCodeService,
};
