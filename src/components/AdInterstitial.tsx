import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import {
  AdEventType,
  InterstitialAd,
} from "react-native-google-mobile-ads";
import { initializeAdMobForUserConsent } from "../ads/initializeAdMob";

type Props = {
  enabled: boolean;
};

const INTERVAL_SECONDS = 3 * 60;
const ANDROID_INTERSTITIAL_ID = "ca-app-pub-1622329571366129/5309153996";
const IOS_INTERSTITIAL_ID = "ca-app-pub-1622329571366129/4100014107";

export default function AdInterstitial({ enabled }: Props) {
  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    let mounted = true;
    let elapsedActiveSeconds = 0;
    let isLoaded = false;
    let isShowing = false;
    let appIsActive = AppState.currentState === "active";
    let ad: InterstitialAd | null = null;
    let removeLoaded = () => {};
    let removeClosed = () => {};
    let removeError = () => {};
    let appStateSubscription: { remove: () => void } | undefined;

    const initialize = async () => {
      try {
        const ready = await initializeAdMobForUserConsent();
        if (!mounted || !ready) return;

        const unitId = Platform.OS === "ios"
          ? IOS_INTERSTITIAL_ID
          : ANDROID_INTERSTITIAL_ID;
        ad = InterstitialAd.createForAdRequest(unitId);

        removeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
          isLoaded = true;
          if (mounted && elapsedActiveSeconds >= INTERVAL_SECONDS && !isShowing) {
            isShowing = true;
            ad?.show().catch(error => {
              console.warn("Interstitial ad could not be shown:", error);
              isShowing = false;
              isLoaded = false;
              ad?.load();
            });
          }
        });

        removeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
          isShowing = false;
          isLoaded = false;
          elapsedActiveSeconds = 0;
          if (mounted) ad?.load();
        });

        removeError = ad.addAdEventListener(AdEventType.ERROR, error => {
          console.warn("Interstitial ad failed to load:", error);
          isLoaded = false;
          isShowing = false;
        });

        ad.load();
      } catch (error) {
        console.warn("Interstitial AdMob initialization failed:", error);
      }
    };

    initialize();

    appStateSubscription = AppState.addEventListener("change", state => {
      appIsActive = state === "active";
    });

    const timer = setInterval(() => {
      if (!mounted || !appIsActive || isShowing) return;
      elapsedActiveSeconds += 1;
      if (elapsedActiveSeconds >= INTERVAL_SECONDS && isLoaded && ad) {
        isShowing = true;
        ad.show().catch(error => {
          console.warn("Interstitial ad could not be shown:", error);
          isShowing = false;
          isLoaded = false;
          ad?.load();
        });
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
      appStateSubscription?.remove();
      removeLoaded();
      removeClosed();
      removeError();
      ad = null;
    };
  }, [enabled]);

  return null;
}
