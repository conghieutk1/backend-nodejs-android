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
let getPredictDisease = (req, res) => {
    let base64String = req.body;

    if (!base64String) {
        return res.send({
            errorCode: 1,
            errMessage: 'Not found file image',
        });
    }
    // Loại bỏ tiền tố data:image/jpeg;base64, từ chuỗi base64 nếu có
    // const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    // const base64Data = base64String.split(';base64,').pop();

    // Chuyển đổi base64 thành dữ liệu binh thường (Buffer)
    // const imageData = Buffer.from(base64String, 'base64');

    const formData = new FormData();

    // Append the file to the form data
    formData.append(
        'file',
        fs.createReadStream(
            'D:/Code_DATN/Backend-Nodejs-Android/src/public/test/0ab9c705-f29e-45ac-b786-9549b3c38f16___GCREC_Bact.Sp 3223.JPG',
        ),
    );

    // formData.append('file1', 'imageData');

    const apiUrl = 'http://localhost:8000/classify/predict';

    axios
        .post(apiUrl, formData, {
            headers: {
                ...formData.getHeaders(), // Bắt buộc phải thêm header 'Content-Type' để chỉ định định dạng của dữ liệu form-data
            },
        })
        .then((response) => {
            console.log('File uploaded successfully to Discord.');
            console.log('data = ', response.data);
            return res.send({
                errorCode: 0,
                errMessage: 'OK',
                data: response.data,
            });
        })
        .catch((error) => {
            console.error('Error uploading file to Discord:', error);
            return res.status(500).send({
                errorCode: 2,
                errMessage: 'Error uploading file to Discord',
            });
        });
};

module.exports = {
    getPredictDisease: getPredictDisease,
};
