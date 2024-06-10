import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './route/web';
import connectDB from './config/conectDB';
import cors from 'cors';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const session = require('express-session');

require('dotenv').config(); // giup chayj dc dong process.env

let app = express();

// Cấu hình Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CREDENTIAL_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CREDENTIAL_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CREDENTIAL_CALLBACK_URL,
        },
        function (accessToken, refreshToken, profile, cb) {
            // Ở đây bạn có thể lưu thông tin user vào database nếu cần
            // console.log('profile: ', profile);
            // console.log('accessToken: ', accessToken);
            // console.log('refreshToken: ', refreshToken);
            return cb(null, profile);
        },
    ),
);
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 60 * 60 * 1000, // Thời gian hết hạn cookie là 10 phút
            // secure: true, //  Cookie sẽ chỉ được gửi qua các kết nối HTTPS(not HTTP)
        },
    }),
);
app.use(passport.initialize());
app.use(passport.session());
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
