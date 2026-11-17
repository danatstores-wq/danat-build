import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import mobileAds, {
  AdsConsent,
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

type Props = {
  enabled: boolean;
};

export default function AdBanner({ enabled }: Props) {
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") {
      setConsentReady(false);
      return;
    }

    let mounted = true;

    const initializeAds = async () => {
      try {
        // UMP checks the latest consent requirement and presents any form
        // configured in AdMob Privacy & messaging.
        await AdsConsent.gatherConsent();
      } catch (error) {
        console.warn("Ad consent collection failed:", error);
      }

      try {
        const consentInfo = await AdsConsent.getConsentInfo();
        if (!consentInfo.canRequestAds) return;

        await mobileAds().initialize();
        if (mounted) setConsentReady(true);
      } catch (error) {
        console.warn("AdMob initialization failed:", error);
      }
    };

    initializeAds();

    return () => {
      mounted = false;
      setConsentReady(false);
    };
  }, [enabled]);

  if (!enabled || !consentReady) return null;

  const configuredUnitId = Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || "ca-app-pub-1622329571366129/9043163685";
  const adUnitId = configuredUnitId || (__DEV__ ? TestIds.BANNER : null);

  // Never ship Google's test ad unit as a production placement.
  if (!adUnitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={error => console.warn("Banner ad failed to load:", error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
  },
});
