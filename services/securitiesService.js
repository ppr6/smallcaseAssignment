const securitiesModel = require('../models/securitiesModel');
const generalConstants = require('../utilities/generalConstants');

const getUnitMarketPrice = function () {
    //can be later updated to make a third-party API call to get the real and updated market price
    return generalConstants.security.CMP;
}

/**
 * to check if a security exists in the collection
 * @param {*} secId 
 */
const checkIfSecurityExists = function (secId) {
    return new Promise((resolve, reject) => {
        var result = securitiesModel.findOne({ securityId: secId })
            .then(function (result) {
                if (result) {
                    return resolve(true);
                }
                else {
                    return reject(false);
                }
            })
            .catch(function (err) {
                return reject(err);
            });

    });
}

module.exports = { getUnitMarketPrice, checkIfSecurityExists };