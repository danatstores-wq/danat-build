# Cloudflare Worker subscription backend (design)

## Scope and safety

This is a source-only implementation plan for Firebase project `danat-build` on the Spark plan. It does not deploy a Worker, create Cloudflare resources, change Firebase configuration, or enable purchases.

The checkout safety gate in PR #15 remains required. Keep that PR open and unmerged until this backend and the app's server-authoritative access flow have been tested.

## Worker responsibilities

One Cloudflare Worker will expose two routes:

- `POST /revenuecat/webhook`: receives RevenueCat events.
- `GET /access`: optional authenticated diagnostic/read endpoint. The app should continue reading its own Firestore entitlement document through Firebase Auth and Firestore Security Rules; it must not trust a client-supplied UID.

The webhook must:
1. Require POST and a configured webhook authorization value. If RevenueCat HMAC signing is enabled, verify the raw request body signature as well.
2. Validate the event envelope, Firebase UID format, product ID, store, and configured entitlement/product allow-list.
3. Ignore RevenueCat TEST events safely; return 200 for unrelated products.
4. Fetch the customer from RevenueCat REST API v1 using a server-only secret API key and URL-encode the Firebase UID in `GET /v1/subscribers/{app_user_id}`.
5. Derive current access from the server response, not from webhook timestamps or a mobile client claim.
6. Check `users/{uid}` exists and read `entitlements/{uid}`. If `adminOverride == true`, preserve the administrator decision.
7. Persist a processed event record and update the entitlement with Firestore REST API writes using preconditions to prevent duplicate or racing updates. A duplicate event ID must not extend access twice.
8. Return a retryable 5xx if a transient RevenueCat or Firestore operation fails; return 2xx only after durable processing or a safe duplicate/ignore decision.

## Entitlement calculation

The existing app treats Apple purchases as non-renewing annual transactions and Google Play as an annual prepaid subscription. The Worker must mirror the actual RevenueCat product configuration:

- Google Play: use the configured Professional entitlement/subscription expiry returned by RevenueCat, including a valid grace-period expiry when applicable.
- Apple: read the allowed product's non-subscription transaction history from the RevenueCat subscriber response, then calculate one calendar year per valid purchase in chronological order, matching the current app's annual non-renewing calculation.
- For both platforms, use the later valid expiry, matching the current app's cross-platform access behavior.
- Do not infer an Apple expiry from a single webhook event. Do not treat a null RevenueCat entitlement expiry as lifetime access until the Apple product type and entitlement configuration have been verified.
- Refunds/cancellations must be reconciled by re-reading the current RevenueCat customer record. RevenueCat documents `CANCELLATION` with `cancel_reason=CUSTOMER_SUPPORT` for refunds; a cancellation can also be a normal unsubscribe, so it must not automatically revoke access. `REFUND_REVERSED` must trigger a fresh reconciliation too.

The precise RevenueCat entitlement identifier and the Apple/Google product configuration must be confirmed in the RevenueCat dashboard before coding the final allow-list. Do not guess these values.

## Firestore data

Keep the current public app data model:

- `users/{uid}`: existing user profile; required to exist before a purchase can be attached to the account.
- `entitlements/{uid}`: server-written store access fields such as `status`, `expiresAt`, `source: "revenuecat"`, `platform`, `productId`, and `lastValidatedAt`. Preserve admin fields and never overwrite a manual override.
- `revenuecatWebhookEvents/{eventId}`: private idempotency/audit record with event type, UID, product ID, and received timestamp. Client access remains denied by the catch-all Firestore rule.

Firestore Security Rules do not constrain a service account using the Firestore REST API. Store the service-account private key only as a Cloudflare Worker secret, use a dedicated service account with the minimum feasible IAM role, and never commit credentials or put them in Expo environment variables. Confirm the IAM role and project scope before creating credentials.

## App changes required later

The current app calculates paid access locally from RevenueCat CustomerInfo. That is not sufficient as the final authority for refunds. Once the Worker is built and tested:

- Make Firestore `entitlements/{uid}` the source of truth for store access as well as administrator overrides.
- Remove client-side entitlement granting from RevenueCat CustomerInfo. The SDK may still be used to present the store purchase UI and refresh CustomerInfo after purchase.
- After purchase/restore, show a pending-verification message and wait for the Worker webhook to update Firestore; never unlock Professional from the local purchase callback alone.
- Keep Firestore rules owner-read/admin-read and prevent client writes to store entitlement fields.
- Keep the purchase/restore UI disabled until the backend, app changes, and sandbox tests all pass.

## Required secrets (names only; values are never committed)

- `REVENUECAT_WEBHOOK_AUTHORIZATION`
- `REVENUECAT_SECRET_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_EMAIL`
- `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`

Use Cloudflare's encrypted Worker secrets. Never paste secret values into chat or GitHub.

## Test matrix before enabling checkout

- Valid Apple sandbox annual purchase.
- Valid Google Play license-test annual prepaid purchase.
- Duplicate webhook delivery.
- Out-of-order purchase and expiration events.
- Apple refund and refund reversal.
- Google Play refund/cancellation and later valid purchase.
- Normal unsubscribe without premature loss of paid access.
- Grace-period/billing-issue behavior.
- Same Firebase UID on both stores.
- Manual admin Professional and Free overrides while store events arrive.
- Unknown product, anonymous RevenueCat ID, missing user profile, invalid authorization/signature.
- RevenueCat API timeout and Firestore conflict/retry.
- Expired access on app restart and on foreground refresh.

## Deployment boundary

Creating this source branch or pull request does not deploy anything. Actual Cloudflare deployment and secret creation require explicit approval and should happen only after source review and sandbox testing.
