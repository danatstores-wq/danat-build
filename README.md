# Danat Build

Danat Build is a multilingual construction calculator app built with Expo and React Native.

## Implemented

- Firebase Authentication and user profiles.
- Homeowner and Professional work modes, both available to every user at no cost.
- All calculators and tools are free; there are no subscriptions, paid tiers, in-app purchases, or restore-purchase flows.
- Six quick calculators: concrete, tiles and ceramics, paint, blocks and bricks, sand and cement, and project cost.
- Full Building Calculator with floor, structural, finishing, services, and itemized cost estimates.
- Metric and imperial input/output conversion in quick calculators.
- English, Arabic, and French interface content.
- Dark and light themes.
- Local saved projects and saved calculations.
- AdMob banner placements for all users and Google interstitial ads requested when users tap main feature/navigation icons, with a strict three-minute cooldown between shown interstitials.
- Internet connection is required to use the app. The app checks reachability and blocks the interface while offline, with a retry action.
- Web export and GitHub Pages deployment.

## Free and ad-supported model

Danat Build is completely free to use. Every user can access both Homeowner and Professional work modes and all available tools. There are no paid plans, subscriptions, in-app purchases, or website payments. The app is supported by AdMob advertising.

Firebase Spark remains the selected Firebase plan; no Firebase billing upgrade is needed for the free feature set.

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
