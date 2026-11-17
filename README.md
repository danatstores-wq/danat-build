# Danat Build

Danat Build is a multilingual construction calculator app built with Expo and React Native.

## Implemented

- Firebase Authentication and user profiles.
- Free/Homeowner and Professional access modes.
- Firebase-backed Professional entitlement checks.
- Administrator screen for granting and revoking Professional access, with an audit trail.
- Six quick calculators: concrete, tiles and ceramics, paint, blocks and bricks, sand and cement, and project cost.
- Full Building Calculator with floor, structural, finishing, services, and itemized cost estimates.
- Metric and imperial input/output conversion in quick calculators.
- English, Arabic, and French interface content.
- Dark and light themes.
- Local saved projects and saved calculations.
- AdMob banner and timed interstitial placements for Free users; Professional users are ad-free.
- Web export and GitHub Pages deployment.

## Subscription and payment status

The Professional plan is intended to cost **$10 for one year with manual renewal**. Website card payments are not part of the project scope.

Google Play and Apple App Store purchases are not enabled. Store developer accounts and RevenueCat platform configuration are still required before real purchases can be accepted. The RevenueCat webhook source is present, but a trusted external backend must be deployed and tested before automatic store-purchase entitlements can be activated. Do not enable purchase buttons before end-to-end verification.

Firebase Spark remains the selected plan. The current manual administrator grant/revoke flow is separate from paid store purchases.

## Saved projects

Projects and calculations are currently stored locally on the device. They are not synchronized between devices or backed up to Firebase. PDF export and cross-device project sync remain future work.

## Validation

GitHub Actions validates:

- Building quantity estimator and market benchmark translation regression tests.
- Quick calculator regression tests.
- TypeScript.
- Expo native config plugins.
- Firebase Functions compilation.
- Web export.

Run locally:

```bash
npm install
npm run test:quantities
npm run test:calculators
npx tsc --noEmit
npx expo export --platform web
```

Construction calculations are preliminary estimates. Structural design, reinforcement, and material specifications must be reviewed by a qualified construction professional before construction or purchasing decisions.
