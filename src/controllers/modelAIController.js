import modelAIService from '../services/modelAIService';

let getPredictDisease = async (req, res) => {
    // console.log(req.body);
    let response = await modelAIService.getDataPredictFromPythonServer(req.body);
    console.log('response modelAIService = ', response);

    return res.send(response);
};

module.exports = {
    getPredictDisease: getPredictDisease,
};
