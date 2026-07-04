const express = require('express');
const router = express.Router();
const {
  initiateBillFetch,
  createTransaction,
  verifyPaymentAndPayBill
} = require('../controllers/bbpsController');

router.post('/fetch-bill', initiateBillFetch);
router.post('/create-txn', createTransaction);
router.post('/verify-payment', verifyPaymentAndPayBill);

module.exports = router;
