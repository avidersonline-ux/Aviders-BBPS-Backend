import crypto from 'crypto';

/**
 * Generates the Eko Signature (HMAC-SHA256) for API authentication
 * @param {string} secretKey - EKO_SECRET_KEY
 * @param {string} developerKey - EKO_DEVELOPER_KEY
 */
export const generateEkoSignature = (secretKey, developerKey) => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(timestamp)
    .digest('base64');

  return {
    'developer_key': developerKey,
    'timestamp': timestamp,
    'signature': signature
  };
};
