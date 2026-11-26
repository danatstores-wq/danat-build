# Cloudflare Worker subscription backend (design)

## Scope and safety

This is a source-only implementation plan for Firebase project `danat-build` on the Spark plan. It does not deploy a Worker, create Cloudflare resources, change Firebase configuration, or enable purchases.

This branch now contains its own checkout safety gate and Firestore-authoritative app access changes. Keep the gate disabled until the backend and app flow have been tested; PR #15 remains a separate safety-only review.

## Worker responsibilities

One Cloudflare Worker will expose two routes:

- `POST /revenuecat/webhook`: receives RevenueCat events.
- `GET /access`: optional authenticated diagnostic/read endpoint. The app should continue reading its own Firestore entitlement document through Firebase Auth and Firestore Security Rules; it must not trust a client-supplied UID.

The webhook must:
1. Require POST and a configured webhook authorization value. When `REVENUECAT_WEBHOOK_SIGNING_SECRET` is configured, verify RevenueCat's HMAC-SHA256 signature over the exact raw request body, enforce a five-minute signature timestamp window, and compare signatures in constant time.
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
- Apple: RevenueCat can detect refunds for non-subscription purchases when App Store Platform Server Notifications are configured. RevenueCat's webhook documentation describes `CANCELLATION` for a subscription or non-renewing purchase that was canceled or refunded; `cancel_reason=CUSTOMER_SUPPORT` identifies an Apple-support refund, and the event includes the store transaction identifier. A normal `UNSUBSCRIBE` reason must not be treated as a refund.
- Maintain a transaction ledger in Firestore keyed by a hash of store + product ID + transaction ID. Record every accepted Apple `NON_RENEWING_PURCHASE`; mark only that exact transaction refunded on a matching Apple `CANCELLATION` with `CUSTOMER_SUPPORT`; and reverse that marker only on a matching `REFUND_REVERSED`. Handle refund-before-purchase delivery by retaining a tombstone so a later purchase webhook cannot restore the refunded transaction. Recompute the annual access end date from the chronological set of non-refunded purchases, rather than incrementing the current aggregate expiry.
- This ledger is reliable only for transactions whose purchase and refund notifications have been ingested. The RevenueCat subscriber API's documented `non_subscriptions` entries do not expose a refund marker. Therefore, existing Apple purchases predating ledger activation require a controlled migration/reconciliation; do not silently treat an incomplete ledger as complete or grant access based on unverified historical transactions. Keep Apple checkout disabled until App Store Server Notifications are configured in App Store Connect and RevenueCat, the event ledger is tested with a sandbox refund and refund reversal, and legacy-account handling is decided.
- For both platforms, use the later valid expiry, matching the current app's cross-platform access behavior.
- Do not infer an Apple expiry from a single webhook event. Do not treat a null RevenueCat entitlement expiry as lifetime access until the Apple product type and entitlement configuration have been verified.
- Refunds/cancellations must be reconciled by re-reading the current RevenueCat customer record. RevenueCat documents `CANCELLATION` with `cancel_reason=CUSTOMER_SUPPORT` for refunds; a cancellation can also be a normal unsubscribe, so it must not automatically revoke access. `REFUND_REVERSED` must trigger a fresh reconciliation too. Do not assume the subscriber response exposes refund status for every non-renewing transaction; prove that field/source before using transaction history to calculate Apple access.

The precise RevenueCat entitlement identifier and the Apple/Google product configuration must be confirmed in the RevenueCat dashboard before coding the final allow-list. Do not guess these values. RevenueCat's documented `GET /v1/subscribers/{app_user_id}` response is wrapped in `subscriber`; its `non_subscriptions` sample does not expose a refund marker, so the Worker must rely on the separately persisted, transaction-level webhook ledger for Apple refunds and must explicitly handle pre-ledger purchases.

## Worker source currently added

The branch now includes an initial Cloudflare Worker implementation at `workers/revenuecat/index.mjs` and a Wrangler manifest at `workers/revenuecat/wrangler.toml`.

The Worker currently:
- Authenticates the webhook using the configured authorization secret.
- Rejects anonymous/invalid Firebase UIDs and ignores products outside the configured Apple/Google allow-list.
- Re-fetches the RevenueCat subscriber record using a server-only API key.
- Uses a service-account JWT to access Firestore REST without Firebase Functions/Blaze.
- Persisting Apple transaction ledger changes, entitlement updates, and webhook idempotency records in one Firestore Commit request with update preconditions.
- Preserves an existing administrator override and fails closed when Apple transaction history is incomplete.
- Uses the validated Google Play entitlement/base-plan expiry helper.

This is an implementation foundation, not production-ready or deployed. It still requires integration testing against actual RevenueCat sandbox payloads and a dedicated least-privilege Firebase service account. In particular, verify RevenueCat field names/store identifiers and Firestore REST behavior against the real project before deployment. The Worker now supports optional HMAC verification when the signing-secret variable is configured; until then, the required authorization header remains the active webhook authentication control. Do not enable purchases based on source validation alone.

## Firestore data

Keep the current public app data model:

- `users/{uid}`: existing user profile; required to exist before a purchase can be attached to the account.
- `entitlements/{uid}`: server-written store access fields such as `status`, `expiresAt`, `source: "revenuecat"`, `platform`, `productId`, and `lastValidatedAt`. Preserve admin fields and never overwrite a manual override.
- `revenuecatWebhookEvents/{eventId}`: private idempotency/audit record with event type, UID, product ID, transaction ID, and received timestamp. Client access remains denied by the catch-all Firestore rule.
- `revenuecatTransactions/{transactionKey}`: private transaction ledger containing UID, store, product ID, transaction ID, purchase timestamp, refund status, and source event IDs. Use a stable one-way hash for the document key; never trust a client-supplied transaction record.

Firestore Security Rules do not constrain a service account using the Firestore REST API. Store the service-account private key only as a Cloudflare Worker secret, use a dedicated service account with the minimum feasible IAM role, and never commit credentials or put them in Expo environment variables. Confirm the IAM role and project scope before creating credentials.

## App-side safety changes now included in this branch

- Store access is read from the server-written `entitlements/{uid}` Firestore document; local RevenueCat CustomerInfo no longer grants Professional.
- A valid store entitlement requires `source: "revenuecat"`, `status: "active"`, and a future Firestore `expiresAt`.
- Administrator overrides continue to take precedence.
- Entitlement listener errors fail closed.
- Store checkout and restore are hidden in the UI and guarded in the RevenueCat service while `STORE_PURCHASES_ENABLED` is false.
- The purchase screen explains in English, Arabic, and French that access activates only after server verification.
- The eventual purchase/restore flow must show a pending-verification state and wait for the Worker webhook to update Firestore; it must never unlock Professional from the local purchase callback alone.

## Required secrets (names only; values are never committed)

- `REVENUECAT_WEBHOOK_AUTHORIZATION`
- `REVENUECAT_WEBHOOK_SIGNING_SECRET` (recommended; enable HMAC signing in the RevenueCat webhook integration when this is configured)
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
- Apple App Store Server Notifications configured end-to-end; sandbox non-renewing purchase, refund, and refund-reversal events update only the matching transaction ledger entry.
- Legacy Apple transaction migration where purchase events predate ledger activation.
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
