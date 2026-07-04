const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { triggerEcoRecharge } = require('../services/ekoService');

// POST /initiate -> Accepts customerMobile, accountNumber, operatorId, and amount.
router.post('/initiate', async (req, res) => {
  try {
    const { customerMobile, accountNumber, operatorId, amount } = req.body;

    if (!customerMobile || !accountNumber || !operatorId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const txnRefId = `AVD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      txnRefId,
      customerMobile,
      accountNumber,
      operatorId,
      amount,
      paymentStatus: 'PENDING',
      bbpsStatus: 'NOT_INITIATED'
    });

    res.status(201).json({
      success: true,
      txnRefId: transaction.txnRefId
    });
  } catch (error) {
    console.error('Initiate Transaction Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /webhook -> The secure bank handler.
router.post('/webhook', async (req, res) => {
  try {
    const { txnRefId, status, amountReceived } = req.body;

    const transaction = await Transaction.findOne({ txnRefId });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Security check: amount received must match expected amount
    if (status === 'SUCCESS' && Number(amountReceived) === transaction.amount) {
      transaction.paymentStatus = 'CAPTURED';
      await transaction.save();

      // Immediately trigger server-to-server Eco BBPS paybill function
      try {
        const ekoResult = await triggerEcoRecharge(transaction);
        // Eko response status: 0 is success for most Eko APIs, but we check response object
        transaction.bbpsStatus = ekoResult.status === 0 ? 'SUCCESS' : 'FAILED';
        transaction.ekoResponse = ekoResult;
        await transaction.save();

        return res.status(200).json({
          success: true,
          paymentStatus: transaction.paymentStatus,
          bbpsStatus: transaction.bbpsStatus
        });
      } catch (ekoError) {
        transaction.bbpsStatus = 'FAILED';
        transaction.ekoResponse = ekoError.response?.data || { error: ekoError.message };
        await transaction.save();
        console.error('Eko Recharge Trigger Error:', ekoError.message);
        return res.status(200).json({ success: true, message: 'Payment captured but BBPS failed', error: ekoError.message });
      }
    } else {
      transaction.paymentStatus = 'FAILED';
      await transaction.save();
      return res.status(400).json({ success: false, message: 'Payment validation failed' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /status/:txnRefId -> Queries MongoDB by txnRefId
router.get('/status/:txnRefId', async (req, res) => {
  try {
    const { txnRefId } = req.params;
    const transaction = await Transaction.findOne({ txnRefId });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      paymentStatus: transaction.paymentStatus,
      bbpsStatus: transaction.bbpsStatus,
      txnRefId: transaction.txnRefId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
