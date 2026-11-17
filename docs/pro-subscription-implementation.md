# Danat Build Professional Access — implementation plan

## Confirmed product behavior
- Professional access costs USD 10 for 12 months.
- The customer must make a new purchase each year; do not enable automatic renewal.
- A valid Professional entitlement unlocks Home Owner and Professional modes and removes ads.
- A free account can use the six individual calculators in Home Owner mode and sees ads.
- A free account can still see the Professional mode button. Selecting it shows the subscription offer and does not open Professional tools.
- The Full Building Calculator and advanced Professional tools require an active entitlement.
- Entitlement follows the signed-in Firebase UID across Android and iOS.

## Store product types
- Google Play: annual prepaid subscription base plan (P1Y), not an auto-renewing base plan. Google documents prepaid plans as manually extended and non-auto-renewing.
- Apple App Store: 1-year non-renewing subscription. Apple does not provide an expiry date for this product type; the app/server must calculate and enforce the 12-month term and support restore/cross-device access.
- Both store transactions must be validated before granting access. Never trust a client-only boolean or a date sent by the app.

## Current repository findings
- Expo SDK 54, React Native 0.81.5, React 19.
- Firebase Authentication is initialized in `src/firebase.ts`.
- `App.tsx` currently defaults to Professional mode and lets any signed-in user select it.
- The six quick calculators are rendered in `App.tsx`; Full Building Calculator is currently hidden unless Professional mode is selected.
- `ProfileScreen.tsx` has a placeholder saying subscription management will be available later.
- `functions/src/index.ts` is still starter boilerplate.
- `firestore.rules` denies all client reads and writes. It must be deliberately reconciled with the existing AuthScreen profile writes before any subscription document is introduced.
- No AdMob or store billing package is currently configured in the inspected files.

## Implementation sequence
1. Configure store products and server credentials:
   - Google Play annual prepaid base plan and service-account access for purchase verification / notifications.
   - Apple non-renewing 1-year product, App Store Server API credentials, and App Store Server Notifications.
   - A trusted backend endpoint that validates each transaction and writes entitlement state using Firebase Admin SDK.
2. Add the mobile purchase/restore layer and identify store purchases with the signed-in Firebase UID.
3. Load entitlement on sign-in and refresh it after purchase/restore; default to free access if entitlement cannot be verified.
4. Enforce the same access policy in navigation and in the screens themselves, not merely by hiding buttons.
5. Add AdMob only for free users; never show ads to active Professional subscribers.
6. Test purchase, restore on a second platform/device, expiry, refund/revocation, offline behavior, and ad suppression before release.

## Safety constraints
- No payment-card numbers, CVV, or expiry dates are stored in Firebase.
- Store secrets and service-account credentials must be server-side only.
- Do not deploy functions or publish store products until credentials, rules, and test results are verified.
- Do not change the existing UI design or calculator formulas as part of the subscription work.
