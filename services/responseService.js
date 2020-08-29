//wrapper to customize the HTTP response
const createResponse = function (res, statusCode, statusMessage, responseContent) {
    console.log(responseContent);
    res.status(statusCode);
    res.statusMessage = statusMessage;
    res.send(responseContent);
}


module.exports = {
    createResponse
};