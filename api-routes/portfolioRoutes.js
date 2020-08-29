const express = require('express');
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const portfolioValidator = require('../validators/portfolioValidator');

router.get('/tradeData', portfolioValidator.validatePortfolioRequest, portfolioController.getPortfolioTradeData);
router.get('/holdings', portfolioValidator.validatePortfolioRequest, portfolioController.getHoldings);
router.get('/returns', portfolioValidator.validatePortfolioRequest, portfolioController.getPortfolioReturns);

module.exports = router;