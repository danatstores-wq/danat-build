import {
  applyAppleTransactionEvent,
  calculateAppleExpiry,
  isAppleLedgerComplete,
  calculateGooglePlayExpiry,
} from "./entitlements.mjs";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const PRODUCT_EVENTS = new Set([
  "INITIAL_PURCHASE", "NON_RENEWING_PURCHASE", "RENEWAL",
  "CANCELLATION", "REFUND_REVERSED", "EXPIRATION",
]);

function response(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function validUid(uid) {
  return typeof uid === "string" && uid.length > 0 && uid.length <= 128
    && !uid.includes("/") && !uid.startsWith("$");
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value)
    ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object" && value.__timestamp) {
    return { timestampValue: new Date(value.__timestamp).toISOString() };
  }
  return { mapValue: { fields: Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)])
  ) } };
}

function fromFirestoreValue(value) {
  if (!value || "nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return Date.parse(value.timestampValue);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function firestoreDocument(name, data) {
  return { name, fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])) };
}

async function sha256Hex(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function base64url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
}

async function serviceAccountToken(env) {
  const email = env.FIREBASE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyPem = env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKeyPem || !env.FIREBASE_PROJECT_ID) throw new Error("Firebase service account is not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = base64url(new TextEncoder().encode(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })));
  const unsigned = header + "." + claims;
  const pem = privateKeyPem.replaceAll("-----BEGIN PRIVATE KEY-----", "").replaceAll("-----END PRIVATE KEY-----", "").replaceAll(String.fromCharCode(10), "").replaceAll(String.fromCharCode(13), "").replaceAll(" ", "");
  const keyBytes = Uint8Array.from(atob(pem), char => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", keyBytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = unsigned + "." + base64url(signature);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!tokenResponse.ok) throw new Error("Firebase OAuth token exchange failed");
  return (await tokenResponse.json()).access_token;
}

async function firestoreRequest(env, token, path, init = {}) {
  const url = "https://firestore.googleapis.com/v1/projects/"
    + encodeURIComponent(env.FIREBASE_PROJECT_ID)
    + "/databases/(default)/documents" + path;
  const result = await fetch(url, {
    ...init,
    headers: { authorization: "Bearer " + token, "content-type": "application/json", ...(init.headers || {}) },
  });
  if (!result.ok) {
    const detail = await result.text();
    const error = new Error("Firestore REST request failed: " + result.status + " " + detail.slice(0, 300));
    error.status = result.status;
    throw error;
  }
  return result.status === 204 ? null : result.json();
}

async function revenueCatSubscriber(env, uid) {
  if (!env.REVENUECAT_SECRET_API_KEY) throw new Error("RevenueCat API key is not configured");
  const url = "https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(uid);
  const result = await fetch(url, { headers: { authorization: "Bearer " + env.REVENUECAT_SECRET_API_KEY } });
  if (!result.ok) {
    const error = new Error("RevenueCat subscriber lookup failed: " + result.status);
    error.status = result.status;
    throw error;
  }
  const payload = await result.json();
  if (!payload.subscriber) throw new Error("RevenueCat response did not contain subscriber");
  return payload.subscriber;
}

async function readDocument(env, token, collection, id) {
  try {
    const doc = await firestoreRequest(env, token, "/" + collection + "/" + encodeURIComponent(id));
    return { name: doc.name, updateTime: doc.updateTime, data: fromFirestoreFields(doc.fields || {}) };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function queryAppleLedger(env, token, uid, productId) {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "revenuecatTransactions" }],
      where: { fieldFilter: {
        field: { fieldPath: "uid" }, op: "EQUAL", value: toFirestoreValue(uid),
      } },
    },
    transaction: undefined,
  };
  const rows = await firestoreRequest(env, token, ":runQuery", {
    method: "POST", body: JSON.stringify(query),
  });
  const ledger = {};
  const docs = [];
  for (const row of rows) {
    if (!row.document) continue;
    const data = fromFirestoreFields(row.document.fields || {});
    if (data.productId !== productId || data.store !== "APP_STORE") continue;
    ledger[data.transactionId] = {
      transactionId: data.transactionId,
      productId: data.productId,
      purchasedAtMs: data.purchasedAtMs,
      refunded: data.refunded === true,
      refundStateAtMs: data.refundStateAtMs || 0,
      eventIds: data.eventIds || [],
    };
    docs.push({ name: row.document.name, updateTime: row.document.updateTime, data });
  }
  return { ledger, docs };
}

function makeWrite(projectId, collection, id, data, fields, precondition) {
  const name = "projects/" + projectId + "/databases/(default)/documents/"
    + collection + "/" + id;
  return {
    update: firestoreDocument(name, data),
    updateMask: { fieldPaths: fields },
    currentDocument: precondition,
  };
}

async function commitWrites(env, token, writes) {
  return firestoreRequest(env, token, ":commit", {
    method: "POST",
    body: JSON.stringify({ writes }),
  });
}

async function processEvent(request, env) {
  if (!env.REVENUECAT_WEBHOOK_AUTHORIZATION) return response(503, { error: "Webhook authorization is not configured" });
  if (request.headers.get("authorization") !== env.REVENUECAT_WEBHOOK_AUTHORIZATION) {
    return response(401, { error: "Unauthorized" });
  }

  let payload;
  try { payload = await request.json(); } catch { return response(400, { error: "Invalid JSON" }); }
  const event = payload?.event;
  if (!event || typeof event.id !== "string" || !event.id) return response(400, { error: "Missing event" });
  if (event.type === "TEST") return response(200, { received: true, ignored: "test_event" });
  if (!PRODUCT_EVENTS.has(event.type)) return response(200, { received: true, ignored: "unsupported_event" });

  const uid = event.app_user_id;
  if (!validUid(uid)) return response(200, { received: true, ignored: "invalid_or_anonymous_user" });

  const appleProduct = env.REVENUECAT_APPLE_PRODUCT_ID;
  const googleProduct = env.REVENUECAT_GOOGLE_PRODUCT_ID;
  const productId = event.product_id;
  const store = event.store;
  if (!((store === "APP_STORE" && productId === appleProduct) ||
        (store === "PLAY_STORE" && productId === googleProduct))) {
    return response(200, { received: true, ignored: "unconfigured_product" });
  }

  const token = await serviceAccountToken(env);
  const [user, currentEntitlement, eventKey] = await Promise.all([
    readDocument(env, token, "users", uid),
    readDocument(env, token, "entitlements", uid),
    sha256Hex(event.id),
  ]);
  if (!user) return response(200, { received: true, ignored: "user_profile_missing" });
  const priorEvent = await readDocument(env, token, "revenuecatWebhookEvents", eventKey);
  if (priorEvent) return response(200, { received: true, duplicate: true });

  const subscriber = await revenueCatSubscriber(env, uid);
  let expiryMs = null;
  let platform = store === "APP_STORE" ? "ios" : "android";
  let ledgerWrite = null;

  if (store === "APP_STORE") {
    const { ledger, docs } = await queryAppleLedger(env, token, uid, appleProduct);
    const result = applyAppleTransactionEvent(ledger, event, appleProduct);
    const nextLedger = result.ledger;
    const transactionId = event.transaction_id;
    const tx = nextLedger[transactionId];
    if (result.changed && tx) {
      const key = await sha256Hex("APP_STORE|" + appleProduct + "|" + transactionId);
      ledgerWrite = {
        key,
        data: {
          uid, store, productId: appleProduct, transactionId,
          purchasedAtMs: tx.purchasedAtMs,
          refunded: tx.refunded,
          refundStateAtMs: tx.refundStateAtMs,
          eventIds: tx.eventIds,
          updatedAt: { __timestamp: Date.now() },
        },
      };
    }
    const completeLedger = { ...ledger };
    if (tx) completeLedger[transactionId] = tx;
    if (!isAppleLedgerComplete(subscriber.non_subscriptions, completeLedger, appleProduct)) {
      return response(503, { error: "Apple transaction ledger is incomplete; reconciliation is required" });
    }
    expiryMs = calculateAppleExpiry(completeLedger);
  } else {
    expiryMs = calculateGooglePlayExpiry(
      subscriber, googleProduct, env.REVENUECAT_GOOGLE_BASE_PLAN_ID || "annual-prepaid",
      env.REVENUECAT_ENTITLEMENT_ID
    );
  }

  const adminOverride = currentEntitlement?.data?.adminOverride === true;
  const now = Date.now();
  const active = Number.isFinite(expiryMs) && expiryMs > now;
  const eventData = {
    eventId: event.id,
    eventType: event.type,
    uid,
    productId,
    transactionId: event.transaction_id || null,
    receivedAt: { __timestamp: now },
    processed: true,
    adminOverridePreserved: adminOverride,
  };

  const writes = [];
  if (ledgerWrite) {
    const existingLedger = (await queryAppleLedger(env, token, uid, appleProduct)).docs
      .find(doc => doc.name.endsWith("/" + ledgerWrite.key));
    const precondition = existingLedger?.updateTime
      ? { updateTime: existingLedger.updateTime } : { exists: false };
    writes.push(makeWrite(env.FIREBASE_PROJECT_ID, "revenuecatTransactions",
      ledgerWrite.key, ledgerWrite.data, Object.keys(ledgerWrite.data), precondition));
  }
  if (!adminOverride) {
    const entitlementData = {
      status: active ? "active" : "revoked",
      expiresAt: expiryMs ? { __timestamp: expiryMs } : null,
      source: "revenuecat",
      platform,
      productId,
      lastValidatedAt: { __timestamp: now },
    };
    const precondition = currentEntitlement?.updateTime
      ? { updateTime: currentEntitlement.updateTime } : { exists: false };
    writes.push(makeWrite(env.FIREBASE_PROJECT_ID, "entitlements", uid,
      entitlementData, Object.keys(entitlementData), precondition));
  }
  writes.push(makeWrite(env.FIREBASE_PROJECT_ID, "revenuecatWebhookEvents",
    eventKey, eventData, Object.keys(eventData), { exists: false }));
  // Firestore Commit applies ledger, entitlement, and idempotency record atomically.
  // Preconditions make concurrent deliveries retry instead of overwriting newer state.
  await commitWrites(env, token, writes);
  return response(200, { received: true, processed: true, adminOverridePreserved: adminOverride });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/revenuecat/webhook") return response(404, { error: "Not found" });
    if (request.method !== "POST") return response(405, { error: "Method not allowed" });
    try {
      return await processEvent(request, env);
    } catch (error) {
      return response(503, { error: "Temporary processing failure", detail: String(error?.message || error).slice(0, 240) });
    }
  },
};
