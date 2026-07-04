import express from 'express';
import {
  initiateBillFetch,
  createTransaction,
  verifyPaymentAndPayBill
} from '../controllers/bbpsController.js';

const router = express.Router();

// @route   POST /api/bbps/fetch-bill
// @desc    Fetch bill details from Eko BBPS
router.post('/fetch-bill', initiateBillFetch);

// @route   POST /api/bbps/create-txn
// @desc    Create a transaction and get UPI Intent
router.post('/create-txn', createTransaction);

// @route   POST /api/bbps/verify-payment
// @desc    Verify UPI payment and trigger Eko BBPS payment
router.post('/verify-payment', verifyPaymentAndPayBill);

export default router;
