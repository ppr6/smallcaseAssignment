const responseService = require('../services/responseService');
const portfolioService = require('../services/portfolioService');

/**
 * endpoint to fetch complete portfolio data - consolidated information about the portfolio, it's securities and their corresponding trades.
 * @param {*} req 
 * @param {*} res 
 */
const getPortfolioTradeData = async function (req, res) {
    var userId = req.query.userId;
    var responseContent;
    try {
        var portfolioTradeData = await portfolioService.getPortfolioTradeData(userId);
        responseContent = {
            'portfolioTradeInformation': portfolioTradeData
        };
        responseService.createResponse(res, 200, 'success', responseContent);
    }
    catch (ex) {
        console.log(JSON.stringify(ex));
        responseContent = ex.message ? { 'message': ex.message } : { 'message': 'Oops! Something went wrong. Please try again in sometime.' }
        var status = ex.status ? ex.status : 500
        responseService.createResponse(res, status, null, responseContent);
    }
}
/**
 * endpoint to fetch current holdings
 * @param {*} req 
 * @param {*} res 
 */
const getHoldings = async function (req, res) {
    var userId = req.query.userId;
    var responseContent;
    try {
        var holdings = await portfolioService.getPortfolioDetails(userId);
        responseContent = {
            'holdings': holdings.portfolioDetails
        };
        responseService.createResponse(res, 200, 'success', responseContent);
    }
    catch (ex) {
        console.log(JSON.stringify(ex));
        responseContent = ex.message ? { 'message': ex.message } : { 'message': 'Oops! Something went wrong. Please try again in sometime.' }
        var status = ex.status ? ex.status : 500
        responseService.createResponse(res, status, null, responseContent);
    }
}


/**
 * endpoint to fetch the current portfolio returns
 * @param {*} req 
 * @param {*} res 
 */
const getPortfolioReturns = async function (req, res) {
    var userId = req.query.userId;
    var responseContent;
    try {
        var pfReturns = await portfolioService.getPortfolioReturns(userId);
        if (pfReturns) {
            responseContent = {
                'portfolioReturns': pfReturns
            };
        }
        else {
            responseContent = {
                'message': 'Error while fetching portfolio returns.',
            };
        }
        responseService.createResponse(res, 200, 'success', responseContent);
    }
    catch (ex) {
        console.log(JSON.stringify(ex));
        responseContent = ex.message ? { 'message': ex.message } : { 'message': 'Oops! Something went wrong. Please try again in sometime.' }
        var status = ex.status ? ex.status : 500
        responseService.createResponse(res, status, null, responseContent);
    }
}

module.exports = { getPortfolioTradeData, getHoldings, getPortfolioReturns }