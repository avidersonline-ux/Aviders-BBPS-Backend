exports.generateUPIIntent = (vpa, name, txnId, amount) => {
  const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&tr=${txnId}&am=${amount.toFixed(2)}&cu=INR&mc=0000`;

  return {
    standardUpi: upiUrl,
    gpayIntent: `intent://pay${upiUrl.split('upi://pay')[1]}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
  };
};
