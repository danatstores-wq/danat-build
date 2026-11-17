import mobileAds, { AdsConsent } from "react-native-google-mobile-ads";

let initialization: Promise<boolean> | null = null;

// Banner and interstitial placements share one consent flow and one SDK
// initialization so they cannot open duplicate consent forms at startup.
export async function initializeAdMobForUserConsent(): Promise<boolean> {
  if (!initialization) {
    initialization = (async () => {
      try {
        await AdsConsent.gatherConsent();
        const consentInfo = await AdsConsent.getConsentInfo();
        if (!consentInfo.canRequestAds) return false;
        await mobileAds().initialize();
        return true;
      } catch (error) {
        console.warn("AdMob consent or initialization failed:", error);
        return false;
      }
    })();
  }

  const ready = await initialization;
  if (!ready) initialization = null;
  return ready;
}
