import Transaction from '../models/Transaction.js';
import * as ekoService from '../services/ekoService.js';
import { generateUPIIntent } from '../utils/upiGenerator.js';

export const initiateBillFetch = async (req, res) => {
  try {
    const { operatorId, accountNumber, customerMobile } = req.body;

    if (!operatorId || !accountNumber || !customerMobile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const billData = await ekoService.fetchBillDetails(operatorId, accountNumber, customerMobile);

    res.status(200).json({
      success: true,
      data: billData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bill details'
    });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { operatorId, accountNumber, customerMobile, amount } = req.body;

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

    const upiLinks = generateUPIIntent(
      process.env.BUSINESS_VPA,
      'Aviders Services',
      txnRefId,
      amount
    );

    res.status(201).json({
      success: true,
      txnRefId: transaction.txnRefId,
      upiIntent: upiLinks.gpayIntent,
      standardUpi: upiLinks.standardUpi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPaymentAndPayBill = async (req, res) => {
  try {
    const { txnRefId, status } = req.body; // In production, use a webhook for status

    const transaction = await Transaction.findOne({ txnRefId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (status === 'SUCCESS') {
      transaction.paymentStatus = 'CAPTURED';
      await transaction.save();

      // Initiate BBPS Payment via Eko
      try {
        const ekoResult = await ekoService.payBill(transaction);
        transaction.bbpsStatus = ekoResult.status === 0 ? 'SUCCESS' : 'FAILED';
        transaction.ekoResponse = ekoResult;
        await transaction.save();

        return res.status(200).json({
          success: true,
          bbpsStatus: transaction.bbpsStatus,
          ekoResponse: ekoResult
        });
      } catch (ekoError) {
        transaction.bbpsStatus = 'FAILED';
        transaction.ekoResponse = ekoError.response?.data || { error: ekoError.message };
        await transaction.save();
        throw ekoError;
      }
    } else {
      transaction.paymentStatus = 'FAILED';
      await transaction.save();
      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
