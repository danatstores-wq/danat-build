const admin = require('firebase-admin');

async function main() {
  const uid = process.argv[2];
  const enabled = process.argv[3] !== 'off';
  if (!uid) {
    throw new Error('Usage: node scripts/set-advertiser-admin.cjs <FIREBASE_AUTH_UID> [off]');
  }
  if (!admin.apps.length) admin.initializeApp();
  const user = await admin.auth().getUser(uid);
  const claims = { ...(user.customClaims || {}) };
  if (enabled) claims.advertiserAdmin = true;
  else delete claims.advertiserAdmin;
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log(`advertiserAdmin ${enabled ? 'enabled' : 'removed'} for ${uid}. The user must sign in again or refresh their ID token.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
