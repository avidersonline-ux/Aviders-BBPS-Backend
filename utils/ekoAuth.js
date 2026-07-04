const crypto = require('crypto');

exports.generateEkoSignature = (secretKey, developerKey) => {
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
