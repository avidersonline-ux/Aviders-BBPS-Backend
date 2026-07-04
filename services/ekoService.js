const axios = require('axios');
const { generateEkoSignature } = require('../utils/ekoAuth');

const EKO_BASE_URL = 'https://api.eko.in/sprint/api/v1';

exports.fetchBillDetails = async (operatorId, accountNumber, customerMobile) => {
  try {
    const authHeaders = generateEkoSignature(
      process.env.EKO_SECRET_KEY,
      process.env.EKO_DEVELOPER_KEY
    );

    const response = await axios.post(
      `${EKO_BASE_URL}/bbps/fetch-bill`,
      {
        operator_id: operatorId,
        customer_params: {
          account_number: accountNumber
        },
        customer_mobile: customerMobile,
        user_code: process.env.EKO_USER_CODE
      },
      { headers: authHeaders }
    );

    return response.data;
  } catch (error) {
    console.error('Eko Fetch Bill Error:', error.response?.data || error.message);
    throw error;
  }
};

exports.payBill = async (txnData) => {
  try {
    const authHeaders = generateEkoSignature(
      process.env.EKO_SECRET_KEY,
      process.env.EKO_DEVELOPER_KEY
    );

    const response = await axios.post(
      `${EKO_BASE_URL}/bbps/pay-bill`,
      {
        operator_id: txnData.operatorId,
        customer_params: {
          account_number: txnData.accountNumber
        },
        amount: txnData.amount,
        customer_mobile: txnData.customerMobile,
        client_ref_id: txnData.txnRefId,
        user_code: process.env.EKO_USER_CODE
      },
      { headers: authHeaders }
    );

    return response.data;
  } catch (error) {
    console.error('Eko Pay Bill Error:', error.response?.data || error.message);
    throw error;
  }
};
