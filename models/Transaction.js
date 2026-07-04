const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    txnRefId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerMobile: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    operatorId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'CAPTURED', 'FAILED'],
      default: 'PENDING',
    },
    bbpsStatus: {
      type: String,
      enum: ['NOT_INITIATED', 'SUCCESS', 'FAILED'],
      default: 'NOT_INITIATED',
    },
    ekoResponse: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
