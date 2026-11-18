import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesPackage } from "react-native-purchases";

let configured = false;
let configuredUserId: string | null = null;

const PROFESSIONAL_PRODUCT_ID = "danat_build_professional_annual";
const GOOGLE_PREPAID_BASE_PLAN_ID = "annual-prepaid";

export type ProfessionalAccess = {
  active: boolean;
  expiresAt: number | null;
};

function getApiKey(): string | undefined {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  }
  return undefined;
}

function isProfessionalProduct(productId?: string | null): boolean {
  return productId === PROFESSIONAL_PRODUCT_ID
    || productId === `${PROFESSIONAL_PRODUCT_ID}:${GOOGLE_PREPAID_BASE_PLAN_ID}`;
}

function addOneCalendarYear(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.getTime();
}

/**
 * Google Play prepaid subscriptions expose a store-verified expiration through
 * RevenueCat's active entitlement. Apple non-renewing subscriptions have no
 * store-supplied expiry, so their verified non-subscription transactions are
 * extended by one calendar year per purchase, including early renewals.
 */
export function getProfessionalAccessFromCustomerInfo(
  customerInfo: CustomerInfo
): ProfessionalAccess {
  const googleEntitlement = Object.values(customerInfo.entitlements.active).find(
    entitlement =>
      entitlement.store === "PLAY_STORE"
      && isProfessionalProduct(entitlement.productIdentifier)
      && !!entitlement.expirationDate
  );

  if (googleEntitlement?.expirationDate) {
    const expiresAt = new Date(googleEntitlement.expirationDate).getTime();
    return {
      active: Number.isFinite(expiresAt) && expiresAt > Date.now(),
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    };
  }

  // CustomerInfo also exposes active subscription product IDs and their
  // store-supplied expiration dates. Use this as a fallback if the Play
  // product has not yet been attached to a RevenueCat entitlement.
  const activeGoogleProduct = customerInfo.activeSubscriptions.find(isProfessionalProduct);
  if (activeGoogleProduct) {
    const expiration = customerInfo.allExpirationDates[activeGoogleProduct]
      || customerInfo.allExpirationDates[PROFESSIONAL_PRODUCT_ID];
    const expiresAt = expiration ? new Date(expiration).getTime() : 0;
    if (expiresAt > Date.now()) {
      return { active: true, expiresAt };
    }
  }

  const applePurchases = customerInfo.nonSubscriptionTransactions
    .filter(transaction => isProfessionalProduct(transaction.productIdentifier))
    .map(transaction => new Date(transaction.purchaseDate).getTime())
    .filter(timestamp => Number.isFinite(timestamp) && timestamp > 0)
    .sort((a, b) => a - b);

  let expiresAt = 0;
  for (const purchaseDate of applePurchases) {
    expiresAt = addOneCalendarYear(Math.max(expiresAt, purchaseDate));
  }

  return {
    active: expiresAt > Date.now(),
    expiresAt: expiresAt || null,
  };
}

export async function configureRevenueCat(firebaseUid: string): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const apiKey = getApiKey();
  if (!apiKey) return false;

  if (!configured) {
    Purchases.configure({ apiKey, appUserID: firebaseUid });
    configured = true;
    configuredUserId = firebaseUid;
  } else if (configuredUserId !== firebaseUid) {
    await Purchases.logIn(firebaseUid);
    configuredUserId = firebaseUid;
  }

  return true;
}

export async function getProfessionalAccess(): Promise<ProfessionalAccess> {
  if (Platform.OS === "web" || !configured) {
    return { active: false, expiresAt: null };
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return getProfessionalAccessFromCustomerInfo(customerInfo);
}

export function subscribeToProfessionalAccess(
  onUpdate: (access: ProfessionalAccess) => void
): () => void {
  if (Platform.OS === "web" || !configured) return () => {};

  const listener = (customerInfo: CustomerInfo) => {
    onUpdate(getProfessionalAccessFromCustomerInfo(customerInfo));
  };

  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export async function logOutRevenueCat(): Promise<void> {
  if (Platform.OS === "web" || !configured || !configuredUserId) return;
  await Purchases.logOut();
  configuredUserId = null;
}

export async function getAnnualProfessionalPackage(): Promise<PurchasesPackage | null> {
  if (Platform.OS === "web" || !configured) return null;

  const offerings = await Purchases.getOfferings();
  const available = offerings.current?.availablePackages || [];
  return available.find(item =>
    item.identifier === "professional_annual"
    && isProfessionalProduct(item.product.identifier)
  ) || null;
}

export async function purchaseProfessionalPackage(
  purchasePackage: PurchasesPackage
): Promise<void> {
  if (Platform.OS === "web" || !configured) {
    throw new Error("In-app purchases are available in the Android and iOS app only.");
  }
  await Purchases.purchasePackage(purchasePackage);
}

export async function restoreProfessionalPurchases(): Promise<void> {
  if (Platform.OS === "web" || !configured) {
    throw new Error("Purchase restoration is available in the Android and iOS app only.");
  }
  await Purchases.restorePurchases();
}
