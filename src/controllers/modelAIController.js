const base64Img = require('base64-img');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
// const base64String = req.body;

// if (base64String) {
//     console.log(base64String);
//     // console.log('imageData OK');
// } else {
//     console.log('imageData failed');
// }
const path = require('path');

function saveBase64Image(base64String, folderPath, fileName) {
    // Decode base64 string into buffer
    const imageBuffer = Buffer.from(base64String, 'base64');
    // Create directory if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    // Create path for the new image file
    const filePath = path.join(folderPath, fileName);
    // Write buffer to file
    fs.writeFileSync(filePath, imageBuffer);
    return filePath;
}
function deleteFile(filePath) {
    try {
        // Kiểm tra xem tệp có tồn tại không
        if (fs.existsSync(filePath)) {
            // Xóa tệp
            fs.unlinkSync(filePath);
            console.log(`File ${filePath} đã được xóa.`);
        } else {
            console.log(`File ${filePath} không tồn tại.`);
        }
    } catch (err) {
        console.error(`Lỗi khi xóa file ${filePath}:`, err);
    }
}
let getPredictDisease = (req, res) => {
    let base64String = req.body.base64FromAndroid;

    if (!base64String) {
        return res.send({
            errorCode: 1,
            errMessage: 'Not found file image',
            data: [],
        });
    }

    const folderPath = './src/public/test'; // Folder path within your project

    const tempName = new Date().getTime();
    const fileName = 'image' + tempName + '.jpg'; // File name for the saved image

    const savedImagePath = saveBase64Image(base64String, folderPath, fileName);
    console.log('Image saved at:', savedImagePath);

    const formData = new FormData();

    // Append the file to the form data
    formData.append('file', fs.createReadStream(savedImagePath));

    const apiUrl = 'http://localhost:8000/classify/predict';

    axios
        .post(apiUrl, formData, {
            headers: {
                ...formData.getHeaders(), // Bắt buộc phải thêm header 'Content-Type' để chỉ định định dạng của dữ liệu form-data
            },
        })
        .then((response) => {
            console.log('File uploaded successfully to Discord.');
            console.log('data = ', response.data.data);
            deleteFile(savedImagePath);
            return res.send({
                errorCode: 0,
                errMessage: 'OK',
                data: response.data.data,
            });
        })
        .catch((error) => {
            console.error('Error uploading file to Discord:', error);
            return res.status(500).send({
                errorCode: 2,
                errMessage: 'Error uploading file to Discord',
                data: [],
            });
        });

    // return res.send({
    //     errorCode: 0,
    //     errMessage: 'OK',
    // });
};

module.exports = {
    getPredictDisease: getPredictDisease,
};
