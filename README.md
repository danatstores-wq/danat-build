# Danat Build

A GitHub-ready starter for the Danat Build construction calculator mobile app.

## Stack
- React Native
- Expo
- TypeScript

## Current starter features
- Dark charcoal and gold visual theme
- English, Arabic and French language toggle (starter labels)
- Home dashboard with calculator categories
- Working concrete-volume calculator with wastage percentage
- Basic project summary screen

## Run locally
1. Install Node.js (LTS) and Git.
2. Install Expo tooling if needed: `npm install`
3. Start the app: `npx expo start`
4. Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS (with the relevant tooling installed).

## Push to GitHub
Create an empty GitHub repository named `danat-build`, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Initial Danat Build app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/danat-build.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub account name.

## Important next steps
This is the first runnable foundation, not the finished production app. Before release, we should add and test each material calculator, pricing configuration, saved projects, PDF reports, robust Arabic RTL layout, app icon/splash artwork, and real-device testing. Construction formulas and local material assumptions should be reviewed by a qualified construction professional before being used for purchasing or building decisions.
