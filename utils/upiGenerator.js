/**
 * Generates a UPI Intent URL for Google Pay
 * @param {string} vpa - Business VPA (from .env)
 * @param {string} name - Business Name
 * @param {string} txnId - Unique Transaction ID
 * @param {number} amount - Amount to pay
 */
export const generateUPIIntent = (vpa, name, txnId, amount) => {
  // GPay Intent format
  // pa: Payee VPA, pn: Payee Name, tr: Transaction Ref ID, am: Amount, cu: Currency
  const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&tr=${txnId}&am=${amount.toFixed(2)}&cu=INR&mc=0000`;

  // To trigger Google Pay specifically on Android:
  // intent://pay?pa=...#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end

  return {
    standardUpi: upiUrl,
    gpayIntent: `intent://pay${upiUrl.split('upi://pay')[1]}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
  };
};
