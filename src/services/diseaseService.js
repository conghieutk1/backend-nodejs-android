import db from '../models/index';

let createNewDiseaseService = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('data =', data);
            // let isExist = await checkUserAccount(data.account);
            // if (isExist === true) {
            //     resolve({
            //         errCode: 1,
            //         errMessage: 'Your account is already in used. Please try another account',
            //     });
            // } else {
            //     let hashPassWordFromBcrypt = await hashUserPassword(data.password);
            //     await db.User.create({
            //         account: data.account,
            //         password: hashPassWordFromBcrypt,
            //         fullName: data.fullname,
            //         role: data.role === 'Admin' ? 'Admin' : 'User',
            //         phoneNumber: data.phonenumber,
            //         gender: data.gender === 'Male' ? 'Male' : 'Female',
            //         address: data.address,
            //     });

            //     resolve({
            //         errCode: 0,
            //         errMessage: 'Create a new user succeedfully!',
            //     });
            // }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createCameraAndServer: createCameraAndServer,
    getAllCameras: getAllCameras,
};
