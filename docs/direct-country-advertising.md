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

The Direct Advertisers menu is available only to the owner Firebase account with UID:

`psu8GgwqNUSKHSQER9wkcEKbbz22`

The same UID check is enforced by Firestore Security Rules. No service-account key, terminal command, or custom-claim setup is required. To change the administrator later, update the owner UID in both `App.tsx` and `firestore.rules` through a reviewed code change.

## Deployment and security

The Firestore rules allow public reads only of active campaign records; only the fixed owner UID above can create, edit, activate/deactivate, or delete campaigns. Publish the updated rules from Firebase Console → Firestore Database → Rules by reviewing and publishing the repository's `firestore.rules` content. Do not activate campaigns until those rules are published.

This feature does not collect payments, process invoices, or guarantee ad impressions; Danat and each advertiser must agree payment and campaign terms separately.
