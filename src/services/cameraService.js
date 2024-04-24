import db from '../models/index';

let checkExistCamera = (authenticationId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let camera = await db.Camera.findOne({
                where: { authenticationId: authenticationId },
            });
            if (camera) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let checkExistServer = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            let server = await db.Server.findOne({
                where: { url: url },
            });
            if (server) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};
let createCameraAndServer = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('data: ', data);
            let errMessage1 = '',
                errMessage2 = '';
            let isExistServer = await checkExistServer(data.dataServer.server);
            let createdServer;
            if (!isExistServer) {
                createdServer = await db.Server.create({
                    url: data.dataServer.server,
                    username: data.dataServer.username,
                    password: data.dataServer.password,
                    userId: data.userInfoFromStorage.id,
                });
            } else {
                createdServer = await db.Server.findOne({
                    where: { url: data.dataServer.server },
                });
            }

            for (let i = 0; i < data.arrAddedCameras.length; i++) {
                let isExistCamera = await checkExistCamera(data.arrAddedCameras[i].Id);
                if (!isExistCamera) {
                    await db.Camera.create({
                        cameraName: data.arrAddedCameras[i].Name,
                        serverId: createdServer != null ? createdServer.id : null,
                        status: 'OFFLINE',
                        authenticationId: data.arrAddedCameras[i].Id,
                    });
                    if (errMessage1 === '') {
                        errMessage1 += 'Save this camera successfully';
                    }
                }
            }
            if (errMessage1 === '') {
                errMessage2 += 'This camera already exists';
            }

            resolve({
                errCode: 0,
                errMessage1,
                errMessage2,
            });
        } catch (error) {
            reject(error);
        }
    });
};
let getAllCameras = (cameraId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cameras = '';
            if (cameraId === 'ALL') {
                cameras = await db.Camera.findAll({
                    attributes: {
                        exclude: [],
                    },
                    order: [['createdAt', 'ASC']],
                });
            }
            if (cameraId && cameraId !== 'ALL') {
                cameras = await db.Camera.findOne({
                    where: { id: cameraId },
                    attributes: {
                        exclude: [],
                    },
                });
            }

            resolve(cameras);
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createCameraAndServer: createCameraAndServer,
    getAllCameras: getAllCameras,
};
