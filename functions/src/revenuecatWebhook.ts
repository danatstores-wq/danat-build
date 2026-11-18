import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

if (getApps().length === 0) initializeApp();

const db = getFirestore();
const webhookAuthorization = defineSecret("REVENUECAT_WEBHOOK_AUTHORIZATION");

const APPLE_PRODUCT_ID = "danat_build_professional_annual";
const GOOGLE_PRODUCT_ID = "danat_build_professional_annual";
const GOOGLE_BASE_PLAN_ID = "annual-prepaid";

type RevenueCatEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  store?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number | null;
  transaction_id?: string;
  original_transaction_id?: string;
  cancel_reason?: string;
  environment?: string;
};

function getAnnualExpiry(purchasedAtMs: number): number {
  const date = new Date(purchasedAtMs);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.getTime();
}

function matchesCurrentTransaction(
  current: { transactionId?: string | null; originalTransactionId?: string | null } | undefined,
  event: RevenueCatEvent
): boolean {
  // Prefer the exact transaction ID when both sides provide one. Fall back
  // to the original transaction ID only when the event lacks a transaction ID.
  if (event.transaction_id && current?.transactionId) {
    return current.transactionId === event.transaction_id;
  }
  if (event.original_transaction_id && current?.originalTransactionId) {
    return current.originalTransactionId === event.original_transaction_id;
  }
  return false;
}

function isAllowedProduct(event: RevenueCatEvent): boolean {
  if (event.store === "APP_STORE") {
    return event.product_id === APPLE_PRODUCT_ID;
  }

  if (event.store === "PLAY_STORE") {
    return event.product_id === GOOGLE_PRODUCT_ID
      || event.product_id === `${GOOGLE_PRODUCT_ID}:${GOOGLE_BASE_PLAN_ID}`;
  }

  return false;
}

export const revenueCatWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [webhookAuthorization],
    maxInstances: 5,
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const expectedAuthorization = webhookAuthorization.value();
    const providedAuthorization = req.get("authorization") || "";
    if (!expectedAuthorization || providedAuthorization !== expectedAuthorization) {
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body?.event as RevenueCatEvent | undefined;
    if (!event?.id || !event.type || !event.app_user_id) {
      res.status(400).send("Invalid RevenueCat event");
      return;
    }

    // Purchases must be made after the app has identified the customer with
    // their Firebase UID. Anonymous RevenueCat IDs are never entitlement keys.
    const uid = event.app_user_id;
    if (uid.startsWith("$") || uid.length > 128 || uid.includes("/")) {
      res.status(400).send("A signed-in Firebase user is required");
      return;
    }

    if (!isAllowedProduct(event)) {
      // Ignore other products in the same RevenueCat project.
      res.status(200).send("Product ignored");
      return;
    }

    const userRef = db.collection("users").doc(uid);
    const entitlementRef = db.collection("entitlements").doc(uid);
    const eventRef = db.collection("revenuecatWebhookEvents").doc(event.id);

    try {
      await db.runTransaction(async transaction => {
        const [processedSnapshot, userSnapshot, entitlementSnapshot] =
          await Promise.all([
            transaction.get(eventRef),
            transaction.get(userRef),
            transaction.get(entitlementRef),
          ]);

        if (processedSnapshot.exists) return;
        if (!userSnapshot.exists) {
          throw new Error("Firebase user profile does not exist");
        }

        const current = entitlementSnapshot.data();
        const currentExpiry = current?.expiresAt instanceof Timestamp
          ? current.expiresAt.toMillis()
          : 0;
        const now = Date.now();
        const eventType = event.type || "";

        // A manual administrator decision is authoritative. Keep recording
        // incoming store events for idempotency, but do not let a later
        // purchase, expiration, cancellation, or refund overwrite that choice.
        if (current?.adminOverride === true) {
          transaction.create(eventRef, {
            type: eventType,
            uid,
            productId: event.product_id,
            receivedAt: FieldValue.serverTimestamp(),
            ignoredBecause: "admin_override",
          });
          return;
        }

        const isPurchase = [
          "INITIAL_PURCHASE",
          "NON_RENEWING_PURCHASE",
          "RENEWAL",
        ].includes(eventType);

        if (isPurchase) {
          const purchasedAt = Number(event.purchased_at_ms);
          if (!Number.isFinite(purchasedAt) || purchasedAt <= 0) {
            throw new Error("Purchase timestamp is missing");
          }

          let expiresAt = Number(event.expiration_at_ms || 0);
          // Each paid purchase adds one year to the shared Firebase account,
          // even if the previous term came from the other app store.
          const accountAnnualExpiry = getAnnualExpiry(Math.max(currentExpiry, purchasedAt));
          if (event.store === "APP_STORE" && !expiresAt) {
            // Apple non-renewing products have no store-supplied expiry.
            expiresAt = accountAnnualExpiry;
          } else if (event.store === "PLAY_STORE") {
            // Keep the later of Google Play's validated prepaid expiry and
            // the shared-account extension (for cross-platform purchases).
            expiresAt = Math.max(expiresAt, accountAnnualExpiry);
          }

          if (!Number.isFinite(expiresAt) || expiresAt <= purchasedAt) {
            throw new Error("Purchase expiry is invalid");
          }

          // Do not let an older/out-of-order event shorten a newer term or
          // replace the transaction identifiers used to match later refunds.
          const isNewestPurchase = expiresAt >= currentExpiry;
          const finalExpiry = Math.max(currentExpiry, expiresAt);
          transaction.set(entitlementRef, {
            status: finalExpiry > now ? "active" : "expired",
            expiresAt: Timestamp.fromMillis(finalExpiry),
            platform: event.store === "APP_STORE" ? "apple" : "google_play",
            productId: event.product_id,
            source: "revenuecat",
            environment: isNewestPurchase
              ? event.environment || "UNKNOWN"
              : current?.environment || "UNKNOWN",
            transactionId: isNewestPurchase
              ? event.transaction_id || current?.transactionId || null
              : current?.transactionId || null,
            originalTransactionId: isNewestPurchase
              ? event.original_transaction_id || current?.originalTransactionId || null
              : current?.originalTransactionId || null,
            lastValidatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        } else if (eventType === "EXPIRATION") {
          // An old expiration must not revoke a later purchase.
          if (!currentExpiry || currentExpiry <= now) {
            transaction.set(entitlementRef, {
              status: "expired",
              lastValidatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }
        } else if (eventType === "CANCELLATION") {
          // A voluntary cancellation (UNSUBSCRIBE) stops future renewal but
          // does not end the already-paid term. Revoke immediately only for
          // an explicit refund or developer-initiated cancellation.
          const shouldRevokeImmediately = [
            "CUSTOMER_SUPPORT",
            "DEVELOPER_INITIATED",
          ].includes(event.cancel_reason || "");
          const matchesCurrent = matchesCurrentTransaction(current, event);
          if (shouldRevokeImmediately && matchesCurrent) {
            transaction.set(entitlementRef, {
              status: "revoked",
              lastValidatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }
        } else if (eventType === "REFUND_REVERSED") {
          if (currentExpiry > now && matchesCurrentTransaction(current, event)) {
            transaction.set(entitlementRef, {
              status: "active",
              lastValidatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }
        }

        transaction.create(eventRef, {
          type: eventType,
          uid,
          productId: event.product_id,
          receivedAt: FieldValue.serverTimestamp(),
        });
      });

      res.status(200).send("OK");
    } catch (error) {
      console.error("RevenueCat webhook processing failed", error);
      res.status(500).send("Webhook processing failed");
    }
  }
);
