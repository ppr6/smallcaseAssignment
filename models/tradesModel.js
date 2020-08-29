const mongoose = require('mongoose');

const TradesSchema = mongoose.Schema;

var tradesModelSchema = new TradesSchema({
    tradeId: {
        type: String,
        unique: true
    },
    userId: {
        type: String,
        ref: 'UserModel'
    },
    securityId: {
        type: String,
        ref: 'SecuritiesModel'
    },
    tradeType: {
        type: String,
        enum: ['B', 'S'] //Buy or Sell
    },
    tradeQuantity: {
        type: Number,
        min: 1
    },
    unitMarketPrice: Number,
    tradeValue: Number,
    tradeStatus: {
        type: String,
        enum: ['I', 'IP', 'C', 'R'], //Initiated, In Progress, Completed
        default: 'C'
    },
    tradeDate: { type: Date, default: new Date() }
});

var TradesModel = mongoose.model('TradesModel', tradesModelSchema);

module.exports = TradesModel;