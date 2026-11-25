import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAppleTransactionEvent,
  calculateAppleExpiry,
  isAppleLedgerComplete,
} from "./entitlements.mjs";

const productId = "danat_build_professional_annual";
const purchase = (id, tx, purchasedAt, eventAt = purchasedAt) => ({
  id, type: "NON_RENEWING_PURCHASE", store: "APP_STORE",
  product_id: productId, transaction_id: tx,
  purchased_at_ms: purchasedAt, event_timestamp_ms: eventAt,
});
const refund = (id, tx, eventAt, reason = "CUSTOMER_SUPPORT") => ({
  id, type: "CANCELLATION", store: "APP_STORE",
  product_id: productId, transaction_id: tx,
  event_timestamp_ms: eventAt, cancel_reason: reason,
});

function apply(ledger, event) {
  return applyAppleTransactionEvent(ledger, event, productId).ledger;
}

test("one purchase grants one calendar year", () => {
  const ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  assert.equal(calculateAppleExpiry(ledger), Date.UTC(2027, 0, 1));
});

test("early purchases extend the previous expiry by one year", () => {
  let ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  ledger = apply(ledger, purchase("p2", "tx2", Date.UTC(2026, 5, 1)));
  assert.equal(calculateAppleExpiry(ledger), Date.UTC(2028, 0, 1));
});

test("refund removes only the matching purchase and recomputes access", () => {
  let ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  ledger = apply(ledger, purchase("p2", "tx2", Date.UTC(2026, 5, 1)));
  ledger = apply(ledger, refund("r1", "tx1", Date.UTC(2026, 6, 1)));
  assert.equal(calculateAppleExpiry(ledger), Date.UTC(2027, 5, 1));
});

test("refund arriving before purchase remains effective", () => {
  let ledger = apply({}, refund("r1", "tx1", Date.UTC(2026, 6, 1)));
  ledger = apply(ledger, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  assert.equal(ledger.tx1.refunded, true);
  assert.equal(calculateAppleExpiry(ledger), null);
});

test("a later refund reversal restores the same transaction", () => {
  let ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  ledger = apply(ledger, refund("r1", "tx1", Date.UTC(2026, 6, 1)));
  ledger = apply(ledger, {
    id: "rr1", type: "REFUND_REVERSED", store: "APP_STORE",
    product_id: productId, transaction_id: "tx1",
    event_timestamp_ms: Date.UTC(2026, 6, 2),
  });
  assert.equal(ledger.tx1.refunded, false);
  assert.equal(calculateAppleExpiry(ledger), Date.UTC(2027, 0, 1));
});

test("out-of-order older refund cannot override a newer reversal", () => {
  let ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  ledger = apply(ledger, {
    id: "rr1", type: "REFUND_REVERSED", store: "APP_STORE",
    product_id: productId, transaction_id: "tx1",
    event_timestamp_ms: Date.UTC(2026, 6, 2),
  });
  ledger = apply(ledger, refund("r1", "tx1", Date.UTC(2026, 6, 1)));
  assert.equal(ledger.tx1.refunded, false);
});

test("unsubscribe is not treated as a refund", () => {
  let ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  ledger = apply(ledger, refund("c1", "tx1", Date.UTC(2026, 6, 1), "UNSUBSCRIBE"));
  assert.equal(ledger.tx1.refunded, false);
  assert.equal(calculateAppleExpiry(ledger), Date.UTC(2027, 0, 1));
});

test("duplicate webhook event does not mutate ledger", () => {
  const ledger = apply({}, purchase("p1", "tx1", Date.UTC(2026, 0, 1)));
  const result = applyAppleTransactionEvent(ledger, purchase("p1", "tx1", Date.UTC(2026, 0, 1)), productId);
  assert.equal(result.changed, false);
  assert.equal(result.reason, "duplicate_event");
});

test("incomplete RevenueCat history fails closed", () => {
  const transactions = { [productId]: [{ id: "tx1", store: "app_store" }, { id: "tx2", store: "app_store" }] };
  const ledger = { tx1: { productId, purchasedAtMs: Date.UTC(2026, 0, 1) } };
  assert.equal(isAppleLedgerComplete(transactions, ledger, productId), false);
  ledger.tx2 = { productId, purchasedAtMs: Date.UTC(2026, 1, 1) };
  assert.equal(isAppleLedgerComplete(transactions, ledger, productId), true);
});
