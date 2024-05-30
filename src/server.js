import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './route/web';
import connectDB from './config/conectDB';
import cors from 'cors';

const session = require('express-session');

require('dotenv').config(); // giup chayj dc dong process.env

let app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 120 * 60 * 1000, // Thời gian hết hạn cookie là 10 phút
            // secure: true, //  Cookie sẽ chỉ được gửi qua các kết nối HTTPS(not HTTP)
        },
    }),
);

// Cấu hình CORS
app.use(cors({ origin: true }));

// Cấu hình body parser với giới hạn kích thước yêu cầu lớn
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Phục vụ các file tĩnh từ thư mục 'public'
app.use(express.static(__dirname + '/public'));

// Khởi tạo view engine
viewEngine(app);

// Đặt middleware tại đây (ví dụ middleware log request)
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// Khởi tạo các route
initWebRoutes(app);

// Kết nối cơ sở dữ liệu
connectDB();

let port = process.env.PORT || 8888; //Port === undefined => Port = 8888

// Bắt đầu server
app.listen(port, () => {
    //callback
    console.log('Backend Nodejs is running on the port: ' + port);
    console.log('Local: http://localhost:' + port);
});
