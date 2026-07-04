const axios = require('axios');
const crypto = require('crypto');

/**
 * Securely triggers a BBPS recharge via Eco India (Eko)
 * @param {Object} txnData - Transaction document from MongoDB
 */
exports.triggerEcoRecharge = async (txnData) => {
  try {
    const secretKey = process.env.EKO_SECRET_KEY;
    const developerKey = process.env.EKO_DEVELOPER_KEY;
    const userCode = process.env.EKO_USER_CODE;
    const timestamp = Date.now().toString();

    // 1. Generate Eko signature/auth headers
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp)
      .digest('base64');

    const headers = {
      'developer_key': developerKey,
      'secret-key-timestamp': timestamp,
      'secret-key': signature,
      'Content-Type': 'application/json'
    };

    // 2. Generate request_hash (timestamp + utility_acc_no + amount + user_code)
    const hashString = `${timestamp}${txnData.accountNumber}${txnData.amount}${userCode}`;
    const requestHash = crypto
      .createHmac('sha256', secretKey)
      .update(hashString)
      .digest('base64');

    // 3. Prepare payload for Eko BBPS v3
    // Note: Fields like initiator_id, source_ip, latlong should be configured in .env or passed from client
    const payload = {
      initiator_id: process.env.EKO_INITIATOR_ID || '1234567890',
      source_ip: process.env.EKO_SOURCE_IP || '127.0.0.1',
      user_code: userCode,
      amount: txnData.amount.toString(),
      client_ref_id: txnData.txnRefId,
      utility_acc_no: txnData.accountNumber,
      confirmation_mobile_no: txnData.customerMobile,
      sender_name: 'Aviders Customer',
      operator_id: txnData.operatorId,
      latlong: process.env.EKO_LATLONG || '28.6139,77.2090', // Default to Delhi coordinates if missing
      request_hash: requestHash
    };

    const response = await axios.post(
      'https://api.eko.in/ekoapi/v3/customer/payment/bbps',
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Eko BBPS Production API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Legacy Eko Sprint API methods (kept for reference or fallback)
 */
exports.fetchBillDetails = async (operatorId, accountNumber, customerMobile) => {
    // ... logic from previous implementation if needed
};
