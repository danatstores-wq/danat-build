import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, generateKeyPairSync } from "node:crypto";
import worker from "./index.mjs";

test("refund-before-purchase persists its tombstone without granting access", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
  const productId = "danat_build_professional_annual";
  const uid = "firebase-user-123";
  const event = {
    id: "apple-refund-before-purchase-1",
    type: "CANCELLATION",
    app_user_id: uid,
    product_id: productId,
    store: "APP_STORE",
    transaction_id: "apple-tx-1",
    cancel_reason: "CUSTOMER_SUPPORT",
    event_timestamp_ms: Date.UTC(2026, 5, 1),
  };
  const commits = [];
  const originalFetch = globalThis.fetch;
  const signingSecret = "test-revenuecat-signing-secret";
  const rawBody = JSON.stringify({ event });
  const signatureTimestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", signingSecret)
    .update(signatureTimestamp + "." + rawBody)
    .digest("hex");

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      return Response.json({ access_token: "test-firestore-token" });
    }
    if (url.startsWith("https://api.revenuecat.com/v1/subscribers/")) {
      return Response.json({
        subscriber: {
          non_subscriptions: {
            [productId]: [{
              id: "apple-tx-1",
              store: "app_store",
              purchase_date: "2026-01-01T00:00:00Z",
            }],
          },
          entitlements: {},
          subscriptions: {},
        },
      });
    }
    if (url.includes("firestore.googleapis.com")) {
      if (url.endsWith("/documents/users/" + uid)) {
        return Response.json({
          name: "projects/test/databases/(default)/documents/users/" + uid,
          updateTime: "2026-01-01T00:00:00.000Z",
          fields: {},
        });
      }
      if (url.includes("/documents/entitlements/") ||
          url.includes("/documents/revenuecatWebhookEvents/")) {
        return new Response("not found", { status: 404 });
      }
      if (url.endsWith("/documents:runQuery")) {
        return Response.json([]);
      }
      if (url.endsWith("/documents:commit")) {
        const body = JSON.parse(init.body);
        commits.push(body);
        return Response.json({ writeResults: [] });
      }
    }
    throw new Error("Unexpected mocked request: " + url);
  };

  try {
    const request = new Request("https://worker.test/revenuecat/webhook", {
      method: "POST",
      headers: {
        authorization: "test-webhook-secret",
        "content-type": "application/json",
        "x-revenuecat-webhook-signature": "t=" + signatureTimestamp + ",v1=" + signature,
      },
      body: rawBody,
    });
    const response = await worker.fetch(request, {
      REVENUECAT_WEBHOOK_AUTHORIZATION: "test-webhook-secret",
      REVENUECAT_WEBHOOK_SIGNING_SECRET: signingSecret,
      REVENUECAT_APPLE_PRODUCT_ID: productId,
      REVENUECAT_GOOGLE_PRODUCT_ID: "danat_build_professional_annual",
      REVENUECAT_SECRET_API_KEY: "test-revenuecat-secret",
      REVENUECAT_ENTITLEMENT_ID: "professional",
      FIREBASE_PROJECT_ID: "test-project",
      FIREBASE_SERVICE_ACCOUNT_EMAIL: "worker@test-project.iam.gserviceaccount.com",
      FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKeyPem,
    });

    assert.equal(response.status, 503);
    assert.equal(commits.length, 1);
    const writes = commits[0].writes;
    assert.equal(writes.length, 1);
    assert.match(writes[0].update.name, /\/revenuecatTransactions\//);
    assert.equal(writes[0].update.fields.refunded.booleanValue, true);
    assert.equal(writes[0].update.fields.purchasedAtMs.nullValue, null);
    assert.equal(writes[0].currentDocument.exists, false);
    assert.equal(
      writes.some(write => /\/entitlements\//.test(write.update.name)),
      false,
    );
    assert.equal(
      writes.some(write => /\/revenuecatWebhookEvents\//.test(write.update.name)),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("configured RevenueCat HMAC rejects an invalid signature before processing", async () => {
  const request = new Request("https://worker.test/revenuecat/webhook", {
    method: "POST",
    headers: {
      authorization: "test-webhook-secret",
      "content-type": "application/json",
      "x-revenuecat-webhook-signature": "t=" + Math.floor(Date.now() / 1000) + ",v1=" + "0".repeat(64),
    },
    body: JSON.stringify({ event: { id: "invalid-signature", type: "TEST" } }),
  });
  const response = await worker.fetch(request, {
    REVENUECAT_WEBHOOK_AUTHORIZATION: "test-webhook-secret",
    REVENUECAT_WEBHOOK_SIGNING_SECRET: "test-revenuecat-signing-secret",
  });
  assert.equal(response.status, 401);
});
