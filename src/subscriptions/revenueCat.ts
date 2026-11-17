import { Platform } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

let configured = false;
let configuredUserId: string | null = null;

function getApiKey(): string | undefined {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  }
  return undefined;
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
    && item.product.identifier === "danat_build_professional_annual"
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
