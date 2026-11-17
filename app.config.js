const TEST_ANDROID_ADMOB_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => {
  const productionBuild = process.env.EAS_BUILD_PROFILE === "production";
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID
    || (!productionBuild ? TEST_ANDROID_ADMOB_APP_ID : undefined);
  const iosAppId = process.env.ADMOB_IOS_APP_ID
    || (!productionBuild ? TEST_IOS_ADMOB_APP_ID : undefined);

  if (productionBuild && (
    !androidAppId
    || !iosAppId
    || !process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
    || !process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
  )) {
    throw new Error(
      "Production builds require real Android/iOS AdMob app IDs and banner ad-unit IDs."
    );
  }

  const existingPlugins = config.plugins || [];
  const plugins = existingPlugins.filter(plugin => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== "react-native-google-mobile-ads";
  });

  return {
    ...config,
    plugins: [
      ...plugins,
      [
        "react-native-google-mobile-ads",
        {
          androidAppId,
          iosAppId,
          delayAppMeasurementInit: true,
        },
      ],
    ],
  };
};
