const responseService = require('../services/responseService');
const securitiesService = require('../services/securitiesService');
const { response } = require('express');
const SecuritiesModel = require('../models/securitiesModel');
const TradesModel = require('../models/tradesModel');

//request validator for trade insert endpoint
const validateInsertable = async function (req, res, next) {
    var responseContent;
    if (!req.body || (req.body && (!req.body.userId || !req.body.trades || (req.body.trades && req.body.trades.length <= 0)))) {
        responseContent = {
            'message': 'Invalid Request'
        }
        return responseService.createResponse(res, 400, 'bad request', responseContent);
    }
    else {
        var secIds = [];
        req.body.trades.forEach((t) => {
            if (!t.securityId || !t.tradeType || !t.tradeQuantity) {
                responseContent = {
                    'message': 'Missing request parameters'
                }
                return responseService.createResponse(res, 400, 'bad request', responseContent);
            } else {
                secIds.push(t.securityId);
            }
        });

        if (secIds.length) {
            var secIdsFetched = await SecuritiesModel.find({
                securityId: {
                    '$in': secIds
                }
            });
            if (secIds.length == secIdsFetched.length) {
                next();
            } else {
                responseContent = {
                    'message': 'Security Ids are invalid'
                }
                return responseService.createResponse(res, 400, 'bad request', responseContent);
            }
        }
    }
};

//request validator for trade update endpoint
const validateUpdatable = async function (req, res, next) {
    var responseContent;
    if (!req.body || (req.body && (!req.body.userId || !req.body.tradeId || !req.body.quantity || !req.body.avgBuyPrice))) {
        responseContent = {
            'message': 'Invalid Request'
        }
        return responseService.createResponse(res, 400, 'bad request', responseContent);
    } else {
        next();
    }
}

//request validator for trade delete endpoint
const validateDeletable = async function (req, res, next) {
    var responseContent;
    if (!req.body || (req.body && (!req.body.userId || !req.body.tradeId))) {
        responseContent = {
            'message': 'Invalid Request'
        }
        return responseService.createResponse(res, 400, 'bad request', responseContent);
    } else {
        next();
    }
}

module.exports = {
    validateInsertable,
    validateUpdatable,
    validateDeletable
}