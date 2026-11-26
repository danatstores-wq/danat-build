import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import {
  AdEventType,
  InterstitialAd,
} from "react-native-google-mobile-ads";
import { initializeAdMobForUserConsent } from "../ads/initializeAdMob";

type Props = {
  enabled: boolean;
  safeToShow: boolean;
  trigger: number;
};

const COOLDOWN_MS = 3 * 60 * 1000;
const ANDROID_INTERSTITIAL_ID = "ca-app-pub-1622329571366129/5309153996";
const IOS_INTERSTITIAL_ID = "ca-app-pub-1622329571366129/4100014107";

export default function AdInterstitial({ enabled, safeToShow, trigger }: Props) {
  const safeToShowRef = useRef(safeToShow);
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const showingRef = useRef(false);
  const pendingTapRef = useRef(false);
  const lastShownAtRef = useRef(0);
  const appActiveRef = useRef(AppState.currentState === "active");

  useEffect(() => {
    safeToShowRef.current = safeToShow;
  }, [safeToShow]);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    let mounted = true;
    let removeLoaded = () => {};
    let removeClosed = () => {};
    let removeError = () => {};

    const showIfEligible = () => {
      const ad = adRef.current;
      if (!mounted || !ad || !loadedRef.current || showingRef.current || !appActiveRef.current || !safeToShowRef.current) return;
      if (Date.now() - lastShownAtRef.current < COOLDOWN_MS) {
        pendingTapRef.current = false;
        return;
      }

      pendingTapRef.current = false;
      showingRef.current = true;
      lastShownAtRef.current = Date.now();
      ad.show().catch(error => {
        console.warn("Interstitial ad could not be shown:", error);
        showingRef.current = false;
        loadedRef.current = false;
        ad.load();
      });
    };

    const initialize = async () => {
      try {
        const ready = await initializeAdMobForUserConsent();
        if (!mounted || !ready) return;

        const unitId = Platform.OS === "ios" ? IOS_INTERSTITIAL_ID : ANDROID_INTERSTITIAL_ID;
        const ad = InterstitialAd.createForAdRequest(unitId);
        adRef.current = ad;

        removeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
          loadedRef.current = true;
          if (pendingTapRef.current) showIfEligible();
        });
        removeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
          showingRef.current = false;
          loadedRef.current = false;
          if (mounted) ad.load();
        });
        removeError = ad.addAdEventListener(AdEventType.ERROR, error => {
          console.warn("Interstitial ad failed to load:", error);
          loadedRef.current = false;
          showingRef.current = false;
          pendingTapRef.current = false;
        });
        ad.load();
      } catch (error) {
        console.warn("Interstitial AdMob initialization failed:", error);
      }
    };

    initialize();
    const appStateSubscription = AppState.addEventListener("change", state => {
      appActiveRef.current = state === "active";
      if (appActiveRef.current && pendingTapRef.current) showIfEligible();
    });

    return () => {
      mounted = false;
      appStateSubscription.remove();
      removeLoaded();
      removeClosed();
      removeError();
      adRef.current = null;
      loadedRef.current = false;
      pendingTapRef.current = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || Platform.OS === "web" || trigger === 0) return;
    if (!safeToShowRef.current) return;

    if (Date.now() - lastShownAtRef.current < COOLDOWN_MS) return;
    pendingTapRef.current = true;

    const ad = adRef.current;
    if (ad && loadedRef.current) {
      const now = Date.now();
      if (now - lastShownAtRef.current >= COOLDOWN_MS && appActiveRef.current && !showingRef.current) {
        pendingTapRef.current = false;
        showingRef.current = true;
        lastShownAtRef.current = now;
        ad.show().catch(error => {
          console.warn("Interstitial ad could not be shown:", error);
          showingRef.current = false;
          loadedRef.current = false;
          ad.load();
        });
      }
    }
  }, [enabled, trigger]);

  return null;
}
