const mongoose = require('mongoose');

const PortfolioSchema = mongoose.Schema;

var portfolioModelSchema = new PortfolioSchema({
    portfolioId: {
        type: String,
        unique: true
    },
    userId: {
        type: String,
        ref: 'UserModel'
    },
    portfolioDetails: [
        {
            securityId: {
                type: String,
                ref: 'SecuritiesModel'
            },
            avgBuyPrice: Number,
            currentQuantity: Number
        }
    ]

});

var PortfolioModel = mongoose.model('PortfolioModel', portfolioModelSchema);

module.exports = PortfolioModel;