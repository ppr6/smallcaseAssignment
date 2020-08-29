const portfolioModel = require('../models/portfolioModel');
const securitiesModel = require('../models/securitiesModel');
const securitiesService = require('../services/securitiesService');
const crypto = require('crypto');
const TradesModel = require('../models/tradesModel');
const tradeService = require('../services/tradeService');
const PortfolioModel = require('../models/portfolioModel');

/**
 * method to get the portfolio details for a particular user
 * @param {*} userId 
 */
const getPortfolioDetails = async function (userId) {
    try {
        var data = await portfolioModel.findOne({ userId: userId });
        if (data)
            return data;
        else
            return null;
    } catch (err) {
        throw { message: `fetching of portfolio failed.` }
    }
};

/**
 * method to update the existing portfolio data
 * @param {*} pfData 
 */
const updatePortfolioDetails = async function (pfData) {
    try {
        pfData.portfolioDetails = pfData.portfolioDetails.filter(x => {
            return x.currentQuantity > 0;
        });
        await pfData.save()
    } catch (err) {
        throw { message: `Error while updating the portfolio.` }
    }
}

/**
 * method to create a new portfolio
 */
const createNewPortfolio = function () {
    return new portfolioModel();
}

/**
 * method to get the portfolio information with associated trade data for the securities
 * @param {*} userId 
 */
const getPortfolioTradeData = async function (userId) {
    var portfolio = await PortfolioModel.findOne({
        userId: userId
    }).lean();
    if (portfolio) {
        var result = await getAllTrades(userId);
        portfolio.trades = {};
        if (result) {
            result.forEach((t) => {
                portfolio.trades[t._id] = [...t.trades];
            });
        }
        return portfolio;
    }
    else {
        throw { message: `Portfolio doesn't exist for user ${userId}`, status: 404 };
    }
}

/**
 * method to fetch portfolio returns
 * @param {*} userId 
 */
const getPortfolioReturns = async function (userId) {
    var portfolio = await getPortfolioDetails(userId);
    if (portfolio) {
        var returns = calculatePortfolioReturns(portfolio);
        return returns;
    } else {
        throw { message: `Portfolio not found for user ID ${userId}`, status: 404 };
    }
}

/**
 * method to calculate portfolio returns based on the formula [(currentMarketPrice - avgBuyPrice) * quantity] for each security in the portfolio
 * @param {*} pf 
 */
const calculatePortfolioReturns = function (pf) {
    var pfReturns;
    if (pf.portfolioDetails && pf.portfolioDetails.length > 0) {
        pfReturns = pf.portfolioDetails.map((val, i) => {
            return (securitiesService.getUnitMarketPrice() - val.avgBuyPrice) * val.currentQuantity;
        }).reduce((prev, cur) => {
            return prev + cur
        }, 0);
        return pfReturns;
    }
    else {
        return null;
    }
}

/**
 * gets all trade information using aggregation
 * @param {*} userId 
 */
const getAllTrades = async function (userId) {
    const query = [
        { "$match": { "userId": userId } },
        { "$sort": { "_id": 1 } },
        {
            "$group": {
                "_id": "$securityId",
                "trades": {
                    "$push": {
                        "tradeStatus": "$tradeStatus",
                        "securityId": "$securityId",
                        "tradeType": "$tradeType",
                        "tradeValue": "$tradeValue",
                        "unitMarketPrice": "$unitMarketPrice",
                        "tradeQuantity": "$tradeQuantity",
                        "userId": "$userId",
                        "tradeId": "$tradeId"
                    }
                }
            }
        }]
    var trades = await TradesModel.aggregate(query);
    return trades;
}

module.exports = {
    getPortfolioDetails,
    updatePortfolioDetails,
    createNewPortfolio,
    getPortfolioTradeData,
    getPortfolioReturns
};