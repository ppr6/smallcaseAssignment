const responseService = require('../services/responseService');
const tradeService = require('../services/tradeService');
const { response } = require('express');

/**
 * endpoint to insert one or more trades for securities in the portfolio
 * @param {*} req 
 * @param {*} res 
 */
const addTrades = async function (req, res) {

    var tradeObjs = req.body.trades;
    var userId = req.body.userId;
    var responseContent;
    try {
        let result = await tradeService.insertTrades(userId, tradeObjs);
        if (result) {
            responseContent = {
                'message': 'Trade data inserted successfully.',
                'data': result
            };
        }
        else {
            responseContent = {
                'message': 'Error while inserting trade data.',
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
};

/**
 * endpoint to update a trade for a security in the portfolio
 * @param {*} req 
 * @param {*} res 
 */
const updateTrade = async function (req, res) {
    var body = req.body;
    var responseContent;
    try {
        let result = await tradeService.updateTrade(body);
        if (result) {
            responseContent = {
                'message': 'Trade record updated successfully.',
                'data': result
            };
        }
        else {
            responseContent = {
                'message': 'Error while updating trade record.',
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
};

/**
 * endpoint to delete a trade for a security in the portfolio
 * @param {*} req 
 * @param {*} res 
 */
const deleteTrade = async function (req, res) {
    var userId = req.body.userId;
    var tradeId = req.body.tradeId;
    var responseContent;
    try {
        await tradeService.deleteTrade(userId, tradeId);
        responseContent = {
            'message': 'Trade record deleted successfully.',
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


module.exports = { addTrades, updateTrade, deleteTrade };