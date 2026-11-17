# Danat Build access — Firebase Spark plan

## What works on the free Spark plan

- Firebase Authentication remains the sign-in system.
- Firestore stores user profiles and access entitlements.
- Free users keep the six Home Owner calculators and ads.
- Professional access can be granted or revoked manually by an administrator.
- The Admin Users screen searches for an exact email in the user profile collection.
- Firestore Security Rules allow the user-directory search and entitlement writes only when the signed-in Firebase ID token has the `admin: true` custom claim.
- Every manual access change is written to `adminAccessChanges`; only administrators can create audit entries and clients cannot read or alter them.
- The initial administrator custom claim is assigned once with `functions/scripts/set-admin-claim.mjs` using trusted local Firebase Admin credentials. No public endpoint is used.

## Important payment limitation

Cloud Functions and a trusted store-webhook receiver are not deployed on Spark. Therefore the app must not accept Google Play or Apple payments while it has no trusted way to validate those transactions and update entitlements. The Professional purchase and restore buttons are disabled in the app. The $10/year plan information remains visible. Do not manually grant Professional access as proof of payment; manual grants are administrator overrides for testing or complimentary access.

To enable secure automatic store purchases later, a trusted backend that validates Google Play and Apple transactions is required. This can be Firebase Cloud Functions on Blaze or another secure backend. Do not let the mobile client write a purchase entitlement or expiry directly.

## Deploy Firestore rules

From the repository root, after signing in with Firebase CLI and selecting project `danat-build`:

```bash
firebase login
firebase use danat-build
firebase deploy --only firestore:rules
```

Deploying Firestore rules does not require upgrading the Firebase project to Blaze.

## Assign the first administrator

1. In Firebase Console → Authentication → Users, copy the administrator account's UID.
2. From the repository's `functions` directory, install dependencies if needed.
3. Authenticate Firebase Admin SDK locally using Application Default Credentials (for example, `gcloud auth application-default login`) or a service-account credential stored securely on the administrator's own computer.
4. Run the one-time script with the UID:

```bash
ADMIN_UID="YOUR_FIREBASE_AUTH_UID" node scripts/set-admin-claim.mjs
```

Never paste service-account JSON, private keys, passwords, or access tokens into chat or commit them to GitHub.

5. Sign out of Danat Build and sign in again so Firebase refreshes the ID token containing the admin claim.

## Test manual access

1. Sign in as the administrator and open More → Admin Users.
2. Search for the exact email of a test account. The test account must sign in once so its profile exists in `users`.
3. Grant Professional access and verify the app unlocks Professional tools for that test account.
4. Change it back to Free / Homeowner and verify Professional tools lock again.
5. In Firestore, inspect `entitlements/{testUid}` and `adminAccessChanges`.

## Entitlement rules

- A manual override uses `adminOverride: true` and `adminStatus: professional` or `free`.
- A manual Professional grant is marked active with an administrative expiry sentinel; the app does not show that sentinel as a real subscription expiry.
- A manual Free change is marked revoked.
- Users can read only their own entitlement. Administrators can read a target entitlement to display its current state.
- Only an administrator can write the manual override fields.
