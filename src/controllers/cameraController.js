import cameraService from '../services/cameraService';

let handleCreateListCameraFromServer = async (req, res) => {
    let message = await cameraService.createCameraAndServer(req.body);
    return res.status(200).json(message);
};
let handleGetAllCameras = async (req, res) => {
    // console.log('id: ', req.query);
    let id = req.query.cameraId;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            users: [],
        });
    }
    let cameras = await cameraService.getAllCameras(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        cameras,
    });
};
module.exports = {
    handleCreateListCameraFromServer: handleCreateListCameraFromServer,
    handleGetAllCameras: handleGetAllCameras,
};
