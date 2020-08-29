const express = require('express');
const router = express.Router();
const tradeController = require("../controllers/tradeController");
const tradeValidator = require('../validators/tradeValidator');

router.post('/insert', tradeValidator.validateInsertable, tradeController.addTrades);
router.put('/update', tradeValidator.validateUpdatable, tradeController.updateTrade)
router.delete('/delete',tradeValidator.validateDeletable, tradeController.deleteTrade);

module.exports = router;