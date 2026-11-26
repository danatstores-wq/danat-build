# Direct country advertising

Danat Build supports direct-sold, country-targeted advertiser campaigns alongside AdMob.

## Campaign behavior

- A user selects a construction market/country in the Building Calculator.
- The app looks for an active campaign in `directAdCampaigns` for that country.
- If a valid campaign is within its start/end dates, a clearly labelled, dismissible Sponsored card appears.
- The user can open the advertiser's HTTPS destination or dismiss the ad and continue.
- If no eligible campaign exists, or the campaign lookup fails, the calculator continues normally. AdMob remains separate.

## Campaign document

Create campaigns only through the in-app Direct Advertisers screen. Each document contains:

- `countryCode`: one of LB, AE, SA, QA, KW, OM, BH, EG, IQ
- `advertiserName`
- `imageUrl`: HTTPS image URL hosted by the advertiser or Danat
- `clickUrl`: HTTPS landing page, company website, or WhatsApp link
- `startsAt`, `endsAt`: Firestore timestamps
- `active`: boolean
- `createdAt`, `updatedAt`: server timestamps

Use a landscape banner image (recommended 1200 x 600 or similar). Obtain the advertiser's permission to use its logo, images and destination link. The ad is labelled Sponsored and is never made to look like a system message.

## Authorize Danat's administrator

The admin menu is hidden unless the signed-in Firebase user has the custom claim `advertiserAdmin: true`. Firestore rules enforce the same claim; hiding the screen alone is not security.

1. Obtain the Firebase project's service-account credentials securely. Never commit the JSON key to GitHub or send it in chat.
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the local service-account JSON path and set `GOOGLE_CLOUD_PROJECT` to the Danat Build Firebase project ID.
3. From the `functions` directory run:

   ```bash
   node scripts/set-advertiser-admin.cjs YOUR_FIREBASE_AUTH_UID
   ```

4. Sign out and sign in again (or refresh the Firebase ID token). The Direct Advertisers menu item will then appear.
5. To revoke access:

   ```bash
   node scripts/set-advertiser-admin.cjs YOUR_FIREBASE_AUTH_UID off
   ```

The script preserves any other existing custom claims.

## Deployment and security

The Firestore rules in this branch allow public reads only of active campaign records; only users with the `advertiserAdmin` custom claim can create, edit, activate/deactivate, or delete campaigns. Deploy the updated rules before activating the feature:

```bash
firebase deploy --only firestore:rules
```

Do not activate direct campaigns until the rules are deployed and the admin claim has been assigned. This feature does not collect payments, process invoices, or guarantee ad impressions; Danat and each advertiser must agree payment and campaign terms separately.
