// Định nghĩa middleware của riêng bạn
exports.loggedin = (req, res, next) => {
    // Kiểm tra nếu phiên đã được thiết lập
    if (req.session && req.session.loggedin) {
        // Nếu đã đăng nhập, thiết lập res.locals.user và tiếp tục
        res.locals.user = req.session.user;
        next();
    } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        res.redirect('/login');
        // const conflictError = '';
        // res.render('login.ejs');
    }
};

exports.isAuth = (req, res, next) => {
    if (req.session && req.session.loggedin) {
        res.locals.user = req.session.user;
        res.redirect('/manage-system/dashboard');
    } else {
        next();
    }
};
