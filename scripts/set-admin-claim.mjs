import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const uid = process.env.ADMIN_UID;
if (!uid) {
  throw new Error("Set ADMIN_UID to the Firebase Authentication UID of the administrator.");
}

initializeApp({ credential: applicationDefault() });
await getAuth().setCustomUserClaims(uid, { admin: true });
console.log(`Administrator role enabled for UID ${uid}. Sign out and sign back in to refresh the token.`);
