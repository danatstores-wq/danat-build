# Danat Build Professional Access — implementation plan

## Confirmed product behavior
- Professional access costs USD 10 for 12 months.
- The customer must make a new purchase each year; do not enable automatic renewal.
- A valid Professional entitlement unlocks Home Owner and Professional modes and removes ads.
- A free account can use the six individual calculators in Home Owner mode and sees ads.
- A free account can still see the Professional mode button. Selecting it shows the subscription offer and does not open Professional tools.
- The Full Building Calculator and advanced Professional tools require an active entitlement.
- Entitlement follows the signed-in Firebase UID across Android and iOS.

## Store product types and RevenueCat configuration
- Google Play: subscription product `danat_build_professional_annual`, base plan `annual-prepaid`, duration P1Y, prepaid (not auto-renewing).
- Apple App Store: non-renewing in-app purchase `danat_build_professional_annual`, with a 1-year term calculated by the trusted backend.
- Firebase `entitlements/{uid}` is the sole access-control authority. The app does not trust a RevenueCat client entitlement. Do not map the Apple non-renewing product to a RevenueCat entitlement: Apple supplies no expiry and RevenueCat could otherwise treat it as active indefinitely. The Firebase webhook owns the one-year expiry for Apple.
- Connect each store in RevenueCat using the required Google Play service-account access and Apple App Store Connect API credentials / server notifications. Enter private credentials only in the RevenueCat dashboard, never in this repository or chat.
- Create a RevenueCat offering named/currently selected as `default`, containing the store products in the annual package `professional_annual`.
- The app accepts only package `professional_annual` with product identifier `danat_build_professional_annual`.
- Configure the RevenueCat webhook with the deployed `revenueCatWebhook` HTTPS URL and an Authorization header matching the Firebase secret `REVENUECAT_WEBHOOK_AUTHORIZATION`. Enable purchase, renewal, expiration, cancellation, and refund-reversed events for both production and sandbox.
- RevenueCat must identify each purchaser with the Firebase UID. The app configures the SDK with that UID before a purchase; anonymous RevenueCat IDs are rejected by the webhook.
- Both store transactions are validated by RevenueCat before its webhook updates Firebase. Never trust a client-only boolean or a date sent by the app.

## Current repository findings
- Expo SDK 54, React Native 0.81.5, React 19.
- Firebase Authentication is initialized in `src/firebase.ts`.
- `App.tsx` now defaults to Home Owner mode and requires a server-managed entitlement before Professional access.
- The six quick calculators are rendered in `App.tsx`; Full Building Calculator is hidden unless Professional mode is selected and the server-managed entitlement is active.
- `ProfileScreen.tsx` now links to the Professional plan screen.
- RevenueCat's React Native SDK is used for store purchase and restore flows; a native development build is required (Expo Go cannot make real purchases).
- `functions/src/revenuecatWebhook.ts` receives authenticated RevenueCat events and writes server-managed entitlement records.
- AdMob uses `react-native-google-mobile-ads@16.4.0`, the Expo SDK 54-compatible line. Version 17 requires React Native 0.86+ and the New Architecture, so it must not be installed into this app without a planned SDK upgrade.
- A consent-aware banner is shown on the Home screen and quick-calculator screens for free mobile users. The web build has no native AdMob placement.
- Development builds use Google's official test app IDs and test banner unit by default. Real AdMob app IDs and banner unit IDs must be added before release.
- `app.config.js` blocks EAS production builds until both RevenueCat platform keys and real Android/iOS AdMob app IDs and banner units are configured.

## Remaining configuration and release sequence
1. Create the Apple and Google store products exactly as listed above and connect both store apps/products in RevenueCat.
2. Add the RevenueCat public platform API keys to the EAS environment as `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`. These are public SDK keys, not secret server credentials.
3. Set the Firebase Functions secret with `firebase functions:secrets:set REVENUECAT_WEBHOOK_AUTHORIZATION`; use the same value in the RevenueCat webhook Authorization header. Never put this value in the app or repository.
4. Deploy Firestore rules and the RevenueCat webhook only after confirming the Firebase project is on a billing plan that permits Cloud Functions deployment.
5. Create the Android and iOS apps in AdMob, configure privacy/consent messages, and set EAS environment values `ADMOB_ANDROID_APP_ID`, `ADMOB_IOS_APP_ID`, `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID`, and `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID`. The app uses Google's test app IDs/test banner units in development only. Consent is gathered before initializing AdMob.
6. Build native Android/iOS development builds and test purchases in the store sandboxes. Expo Go is not sufficient for real purchase tests.
7. Verify first purchase, manual renewal/top-up, restore on a second device/platform with the same Firebase UID, expiry, refunds, revocation, free-user ads, and paid-user ad suppression before release.

## Entitlement document contract

The app now listens to `entitlements/{firebaseUid}` and grants Professional access only when:
- `status` is exactly `active`.
- `expiresAt` is a Firestore Timestamp later than the device's current time.
- The entitlement document is readable from the signed-in Firebase account.

The trusted backend must be the only writer and should store at least:
- `status`: `active` or `expired` (and optionally `revoked`).
- `expiresAt`: server-calculated Firestore Timestamp.
- `platform`: `google_play` or `apple`.
- `productId`: the configured store product identifier.
- `lastValidatedAt`: server timestamp.

Do not accept an entitlement expiry supplied by the mobile client. The app fails closed (Home Owner access) if the document is missing, unreadable, malformed, or expired. The UI gate is a first layer; Professional screens and every privileged backend operation must independently enforce the same entitlement.

## Work completed on the feature branch

- Firestore rules now allow a signed-in user to create/read only their own minimal profile, and read only their own entitlement document. Clients cannot write entitlement data.
- The app defaults to Home Owner mode rather than restoring a locally saved Professional mode.
- Professional mode selection and the Full Building Calculator are gated by the server-managed entitlement.
- Opening a saved Full Building Calculator project is also gated.
- Added RevenueCat SDK dependency and a signed-in Firebase UID identity bridge.
- Added a Professional plan screen with annual purchase and restore actions.
- Added a RevenueCat webhook with an Authorization secret, event idempotency, product allow-list, server-calculated Apple annual expiry, and Firebase Admin entitlement writes.
- Added a development-build profile requirement; no native store transaction has been tested yet.
- Added consent-aware AdMob banners on the Home and quick-calculator screens for free mobile accounts only; the web build intentionally renders no ad.
- Added dynamic native AdMob app-ID configuration with Google's test IDs as safe development defaults.
- Real AdMob app/unit IDs, consent-message configuration, and native device testing remain pending.

## Safety constraints
- No payment-card numbers, CVV, or expiry dates are stored in Firebase.
- Store secrets and service-account credentials must be server-side only.
- Do not deploy functions or publish store products until credentials, rules, and test results are verified.
- Do not change the existing UI design or calculator formulas as part of the subscription work.
