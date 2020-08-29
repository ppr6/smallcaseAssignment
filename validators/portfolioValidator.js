const responseService = require("../services/responseService")

//common validator for portfolio endpoints
const validatePortfolioRequest = function (req, res, next) {
    var responseContent;
    if (!req.query.userId) {
        responseContent = {
            'message': 'User ID is empty'
        }
        return responseService.createResponse(res, 400, 'bad request', responseContent);
    } else {
        next();
    }
}

module.exports = {
    validatePortfolioRequest
}