const ANDROID_ADMOB_APP_ID = "ca-app-pub-1622329571366129~7573722234";
const IOS_ADMOB_APP_ID = "ca-app-pub-1622329571366129~8388110450";

module.exports = ({ config }) => {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID || ANDROID_ADMOB_APP_ID;
  const iosAppId = process.env.ADMOB_IOS_APP_ID || IOS_ADMOB_APP_ID;

  if (process.env.EAS_BUILD_PROFILE === "production" && (
    !process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    || !process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
  )) {
    throw new Error("Production builds require RevenueCat platform API keys.");
  }

  const existingPlugins = config.plugins || [];
  const plugins = existingPlugins.filter(plugin => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== "react-native-google-mobile-ads";
  });

  return {
    ...config,
    newArchEnabled: true, // ViroReact ARCore/ARKit requires Fabric and a native development build; APK is published for device testing
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
      [
        "expo-sensors",
        {
          motionPermission: "Danat Build uses device motion to measure angles and check surface level.",
        },
      ],
      [
        "@reactvision/react-viro",
        {
          android: { xRMode: "AR" },
          ios: {
            cameraUsagePermission: "Danat Build uses the camera to measure real-world distances and room dimensions in augmented reality.",
            microphoneUsagePermission: "Danat Build uses the microphone only when an AR feature explicitly requires it.",
            photosPermission: "Danat Build can access photos when you choose to use them in a project.",
            savePhotosPermission: "Danat Build can save measurement snapshots when you request them.",
          },
          telemetry: false,
        },
      ],
    ],
  };
};
