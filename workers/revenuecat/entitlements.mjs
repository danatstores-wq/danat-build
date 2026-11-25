const APPLE_STORE = "APP_STORE";
const PURCHASE_EVENTS = new Set(["INITIAL_PURCHASE", "NON_RENEWING_PURCHASE", "RENEWAL"]);

function validTimestamp(value) {
  return Number.isFinite(value) && value > 0;
}

function addOneCalendarYear(timestamp) {
  const date = new Date(timestamp);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.getTime();
}

/**
 * Applies one Apple transaction webhook to a transaction ledger.
 * Refund state is ordered by event_timestamp_ms so webhook retries or
 * out-of-order delivery cannot resurrect an older transaction state.
 */
export function applyAppleTransactionEvent(ledger, event, allowedProductId) {
  if (!event || event.store !== APPLE_STORE || event.product_id !== allowedProductId) {
    return { ledger, changed: false, reason: "not_matching_apple_product" };
  }

  const transactionId = typeof event.transaction_id === "string" ? event.transaction_id : "";
  if (!transactionId || transactionId.length > 256 || transactionId.includes("/")) {
    return { ledger, changed: false, reason: "missing_or_invalid_transaction_id" };
  }

  const eventId = typeof event.id === "string" ? event.id : "";
  const eventAt = Number(event.event_timestamp_ms);
  if (!eventId || !validTimestamp(eventAt)) {
    return { ledger, changed: false, reason: "missing_event_identity_or_timestamp" };
  }

  const previous = ledger[transactionId] || {
    transactionId,
    productId: allowedProductId,
    purchasedAtMs: null,
    refunded: false,
    refundStateAtMs: 0,
    eventIds: [],
  };

  if (previous.productId !== allowedProductId) {
    return { ledger, changed: false, reason: "transaction_product_conflict" };
  }

  if (previous.eventIds.includes(eventId)) {
    return { ledger, changed: false, reason: "duplicate_event" };
  }

  const next = {
    ...previous,
    eventIds: [...previous.eventIds, eventId].slice(-100),
  };

  if (PURCHASE_EVENTS.has(event.type)) {
    const purchasedAt = Number(event.purchased_at_ms);
    if (!validTimestamp(purchasedAt)) {
      return { ledger, changed: false, reason: "invalid_purchase_timestamp" };
    }
    if (next.purchasedAtMs === null || purchasedAt < next.purchasedAtMs) {
      next.purchasedAtMs = purchasedAt;
    }
  } else if (
    event.type === "CANCELLATION" &&
    event.cancel_reason === "CUSTOMER_SUPPORT" &&
    eventAt >= next.refundStateAtMs
  ) {
    next.refunded = true;
    next.refundStateAtMs = eventAt;
  } else if (event.type === "REFUND_REVERSED" && eventAt >= next.refundStateAtMs) {
    next.refunded = false;
    next.refundStateAtMs = eventAt;
  } else {
    return { ledger, changed: false, reason: "event_does_not_change_apple_purchase" };
  }

  return {
    ledger: { ...ledger, [transactionId]: next },
    changed: true,
    reason: "updated",
  };
}

/**
 * Rebuilds annual access from all known, non-refunded Apple transactions.
 * A caller must first prove the RevenueCat transaction history is completely
 * represented by this ledger; partial history must never be used to grant access.
 */
export function calculateAppleExpiry(ledger) {
  const purchases = Object.values(ledger)
    .filter(item => item && !item.refunded && validTimestamp(item.purchasedAtMs))
    .sort((a, b) => a.purchasedAtMs - b.purchasedAtMs);

  let expiry = 0;
  for (const purchase of purchases) {
    expiry = addOneCalendarYear(Math.max(expiry, purchase.purchasedAtMs));
  }
  return expiry || null;
}

/**
 * Ensures every matching Apple transaction in RevenueCat's subscriber history
 * has a corresponding purchase record in our webhook ledger. This does not
 * prove notification configuration by itself; that is a separate deployment
 * prerequisite and must be tested with a sandbox refund.
 */
export function isAppleLedgerComplete(nonSubscriptions, ledger, productId) {
  const transactions = nonSubscriptions?.[productId];
  if (!Array.isArray(transactions)) return false;

  return transactions.every(transaction => {
    if (transaction?.store !== "app_store") return true;
    const id = String(transaction.id || "");
    const record = ledger[id];
    return !!id && !!record && record.productId === productId
      && validTimestamp(record.purchasedAtMs);
  });
}
