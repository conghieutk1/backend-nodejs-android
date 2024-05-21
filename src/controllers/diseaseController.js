let createNewDisease = async (req, res) => {
    console.log(req.body);
    let response = {};
    // let response = await CRUDService.createNewUser(req.body);
    // console.log(response);
    // let listAllUsers = await CRUDService.getAllUser();
    return res.render('diseases/manage-diseases.ejs', { message: response.errMessage });
};

module.exports = {
    createNewDisease: createNewDisease,
};
