const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    // Remove potential outer quotes if they exist (common issue in some env setups)
    if (rawJson.startsWith('"') && rawJson.endsWith('"')) {
      rawJson = rawJson.substring(1, rawJson.length - 1);
    }
    serviceAccount = JSON.parse(rawJson);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
    console.error('Raw string length:', process.env.FIREBASE_SERVICE_ACCOUNT?.length);
  }
} else {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.warn('serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT not set.');
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.error('Firebase Admin could not be initialized: No credentials found.');
}

module.exports = admin;
