const TradeModel = require('../models/tradesModel');
const portfolioService = require('../services/portfolioService');
const wtAvgUtility = require('../utilities/weightedAverageUtility');
const crypto = require('crypto');
const securitiesService = require('./securitiesService');

/**
 * method to insert one or more trades for securities in a portfolio
 * @param {*} userId 
 * @param {*} tradeArr 
 */
const insertTrades = async function (userId, tradeArr) {
    var userPortfolioData = await portfolioService.getPortfolioDetails(userId)
    
    if(!userPortfolioData) {
        //create a new portfolio if user doesn't already have one
        userPortfolioData = portfolioService.createNewPortfolio();
        userPortfolioData.userId = userId;
        userPortfolioData.portfolioId = crypto.randomBytes(16).toString("hex");
        userPortfolioData.portfolioDetails = [];
    }
    tradeArr.forEach(t => {
        t.unitMarketPrice = securitiesService.getUnitMarketPrice(); 
        t.tradeValue = t.tradeQuantity * t.unitMarketPrice;
        t.tradeId = crypto.randomBytes(16).toString("hex");
        t.userId = userId;

        if (t.tradeType == "B") { //if the trade is a BUY trade
            var securityIndex = findSecurity(userPortfolioData, t.securityId); //check if the security for which the trade is placed exists in the portfolio
            if (securityIndex != -1) {
                //calculate the average buy price
                userPortfolioData.portfolioDetails[securityIndex].avgBuyPrice = wtAvgUtility.getWeightedAverage({
                    "weight1": userPortfolioData.portfolioDetails[securityIndex].currentQuantity,
                    "value1": userPortfolioData.portfolioDetails[securityIndex].avgBuyPrice,
                    "weight2": t.tradeQuantity,
                    "value2": t.unitMarketPrice
                });
                //update the security quantity in the portfolio:
                userPortfolioData.portfolioDetails[securityIndex].currentQuantity = userPortfolioData.portfolioDetails[securityIndex].currentQuantity + t.tradeQuantity;
            }
            else {
                //insert this new security to the portfolio by taking the current trade data:
                userPortfolioData.portfolioDetails.push({
                    "securityId": t.securityId,
                    "currentQuantity": t.tradeQuantity,
                    "avgBuyPrice": t.unitMarketPrice
                });
            }
        }
        else if (t.tradeType == "S") {
            var securityIndex = findSecurity(userPortfolioData, t.securityId); //check if the security for which the trade is placed exists in the portfolio
            if (securityIndex != -1) {
                //sell trade can be allowed only if the portfolio has greater quantity of shares than the no. of shares requested to be sold:
                if (userPortfolioData.portfolioDetails[securityIndex].currentQuantity >= t.tradeQuantity) {
                    userPortfolioData.portfolioDetails[securityIndex].currentQuantity = userPortfolioData.portfolioDetails[securityIndex].currentQuantity - t.tradeQuantity;
                }
                else {
                    throw { message: `Not enough quantity to sell for ${t.securityId}`, status: 400 }
                }
            }
            else {
                throw { message: `The security ${t.securityId} doesn't exist in the portfolio`, status: 400 };
            }
        }
        else {
            //neither BUY nor SELL
            throw { message: `Incorrect transaction type ${t.tradeType}`, status: 400 };
        }
    });
    // insert the trades
    var updatedTrades = await TradeModel.insertMany(tradeArr)

    //update the portfolio accordingly:
    await portfolioService.updatePortfolioDetails(userPortfolioData)
    return updatedTrades;
};

/**
 * method to update an existing trade
 * @param {*} body 
 */
const updateTrade = async function (body) {
    var portfolioData = await portfolioService.getPortfolioDetails(body.userId);
    if (!portfolioData) {
        throw { message: "Portfolio not found", status: 404 };
    } else {
        //fetch the trade by ID:
        var tradeData = await TradeModel.findOne({ tradeId: body.tradeId });
        if (!tradeData) {
            throw { message: `Trade not found for tradeId: ${body.tradeId}`, status: 404 };
        } else {
            //if the trade is a BUY
            if (tradeData.tradeType == 'B') {
                //if the request is to buy 'lesser' quantity than the previous quantity of this trade, the subsequent sell trade(s) will fail (if any)
                //because there is a possibility of them having a greater sell quantity than what the quantity will be, if we allow lesser buy quantity.
                //so preventing it:
                if (tradeData.tradeQuantity > body.quantity) {
                    throw { message: `Cannot update quantity less than ${tradeData.tradeQuantity}`, status: 400 }
                }
                //check if the security for which the trade is placed exists:
                var index = portfolioData.portfolioDetails.findIndex((x) => {
                    return x.securityId == tradeData.securityId;
                });
                if (index > -1) {
                    //compute the average buy price
                    portfolioData.portfolioDetails[index].avgBuyPrice = wtAvgUtility.updateWeightedAverage({
                        "weight1": portfolioData.portfolioDetails[index].currentQuantity,
                        "value1": portfolioData.portfolioDetails[index].avgBuyPrice,
                        "weight2": body.quantity,
                        "value2": body.avgBuyPrice,
                        "tradeWeight": tradeData.tradeQuantity,
                        "tradeAmount": tradeData.unitMarketPrice
                    })
                    //update the quantity
                    portfolioData.portfolioDetails[index].currentQuantity = portfolioData.portfolioDetails[index].currentQuantity + body.quantity - tradeData.tradeQuantity;
                    tradeData.tradeQuantity = body.quantity;
                    tradeData.unitMarketPrice = body.avgBuyPrice;
                    tradeData.tradeValue = tradeData.tradeQuantity * tradeData.unitMarketPrice;
                } else {
                    //security not found
                    throw { message: `Security not found in portfolio`, status: 400 };
                }
            } else if (tradeData.tradeType == "S") {
                //not allowing current sell quantity to be greater than the existing quantity, as it may lead to improper (negative) holdings in the portfolio:
                if (tradeData.tradeQuantity < body.quantity) {
                    throw { message: `Cannot update trade quantity greater than ${tradeData.tradeQuantity}` }
                } else if (tradeData.tradeQuantity == body.quantity) {
                    //no need of any update here, as weighted average is not computed for a sell and quantity is unchanged:
                    return tradeData;
                } else {
                    //get the corresponding security data:
                    var index = portfolioData.portfolioDetails.findIndex((x) => {
                        return x.securityId == body.securityId;
                    });
                    if (index > -1) {
                        //update quantity:
                        portfolioData.portfolioDetails[index].currentQuantity = tradeData.tradeQuantity - body.quantity;
                    } else {
                        //selling lesser quantity, so increasing the quantity in the portfolio, the delta. 
                        portfolioData.portfolioDetails.push({
                            securityId: tradeData.securityId,
                            avgBuyPrice: tradeData.unitMarketPrice,
                            currentQuantity: tradeData.tradeQuantity - body.quantity
                        });
                    }
                    tradeData.tradeQuantity = body.quantity;
                    tradeData.unitMarketPrice = body.unitMarketPrice;
                    tradeData.tradeValue = tradeData.tradeQuantity * tradeData.unitMarketPrice
                }
            }
        }
        //update the trade
        var result = await TradeModel.findOneAndUpdate({
            tradeId: tradeData.tradeId
        }, tradeData, { new: true })

        //update the portfolio accordinly:
        await portfolioService.updatePortfolioDetails(portfolioData)
        return result;
    }
}

/**
 * method to delete a trade
 * @param {*} userId 
 * @param {*} tradeId 
 */
const deleteTrade = async function (userId, tradeId) {
    //get the portfolio
    var userPortfolioData = await portfolioService.getPortfolioDetails(userId)
    if (userPortfolioData) {
        //fetch the trade object to be deleted
        var tradeToBeDeleted = await TradeModel.findOne({
            tradeId: tradeId
        })
        if (!tradeToBeDeleted) {
            throw { message: `Trade doesn't exist tradeID: ${tradeId}` }
        }
        if (tradeToBeDeleted.tradeType == "B") {
            //find the security
            var securityIndex = findSecurity(userPortfolioData, tradeToBeDeleted.securityId);
            if (securityIndex != -1) {
                //portfolio needs to have a higher quantity as we need to subtract the bought quantity:
                if (userPortfolioData.portfolioDetails[securityIndex].currentQuantity >= tradeToBeDeleted.tradeQuantity) {
                    userPortfolioData.portfolioDetails[securityIndex].avgBuyPrice = wtAvgUtility.getWeightedAverage({
                        "weight1": userPortfolioData.portfolioDetails[securityIndex].currentQuantity,
                        "value1": userPortfolioData.portfolioDetails[securityIndex].avgBuyPrice,
                        "weight2": tradeToBeDeleted.tradeQuantity,
                        "value2": tradeToBeDeleted.unitMarketPrice
                    }, true);

                    //subtract the bought quantity:
                    userPortfolioData.portfolioDetails[securityIndex].currentQuantity =
                        userPortfolioData.portfolioDetails[securityIndex].currentQuantity - tradeToBeDeleted.tradeQuantity;

                    //Now delete the trade:
                    var result = await TradeModel.deleteOne({
                        tradeId: tradeToBeDeleted.tradeId
                    })
                    await portfolioService.updatePortfolioDetails(userPortfolioData)
                    return result;
                }
                else {
                    throw {
                        message: `Delete error - portfolio contains a lesser quantity of the security ${tradeToBeDeleted.securityId} 
                                    (${userPortfolioData.portfolioDetails[securityIndex].currentQuantity}) than the quantity specified by the trade (${tradeToBeDeleted.tradeQuantity}).`
                        , status: 400
                    };
                }
            }
            else {
                throw { message: "The requested security doesn't exist in the portfolio.", status: 400 };
            }
        }
        else if (tradeToBeDeleted.tradeType == "S") {
            //find the security
            var securityIndex = findSecurity(userPortfolioData, tradeToBeDeleted.securityId);
            if (securityIndex != -1) {
                //add back the trade quantity sold by the trade in question
                userPortfolioData.portfolioDetails[securityIndex].currentQuantity =
                    userPortfolioData.portfolioDetails[securityIndex].currentQuantity + tradeToBeDeleted.tradeQuantity;

                //Now delete the trade:
                var result = await TradeModel.deleteOne({
                    tradeId: tradeToBeDeleted.tradeId
                })
            }
            else {
                //this security will not be present in the portfolio, so add it:
                userPortfolioData.portfolioDetails.push({
                    securityId: tradeToBeDeleted.securityId,
                    avgBuyPrice: tradeToBeDeleted.unitMarketPrice,
                    currentQuantity: tradeToBeDeleted.tradeQuantity
                });
            }
            //update the portfolio accordingly:
            await portfolioService.updatePortfolioDetails(userPortfolioData)
            return result;
        }
    }
    else {
        throw { message: "unable to get portfolio data." };
    }
}

/**
 * method to find the security in the portfolio details
 * @param {*} portfolio 
 * @param {*} secId 
 */
const findSecurity = function (portfolio, secId) {
    if (portfolio && portfolio.portfolioDetails && portfolio.portfolioDetails.length > 0) {
        console.log(portfolio.portfolioDetails);
        return portfolio.portfolioDetails.findIndex((p, i) =>
            p.securityId === secId);
    }
    else {
        return -1;
    }
}

module.exports = {
    insertTrades,
    updateTrade,
    deleteTrade
};