const ANDROID_ADMOB_APP_ID = "ca-app-pub-1622329571366129~7573722234";
const IOS_ADMOB_APP_ID = "ca-app-pub-1622329571366129~8388110450";

module.exports = ({ config }) => {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID || ANDROID_ADMOB_APP_ID;
  const iosAppId = process.env.ADMOB_IOS_APP_ID || IOS_ADMOB_APP_ID;

  const existingPlugins = config.plugins || [];
  const plugins = existingPlugins.filter(plugin => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== "react-native-google-mobile-ads" && name !== "expo-image-picker";
  });

  return {
    ...config,
    icon: "./assets/branding/Luxury Gold Construction Emblem.png",
    android: {
      ...(config.android || {}),
      adaptiveIcon: {
        ...(config.android?.adaptiveIcon || {}),
        foregroundImage: "./assets/branding/Luxury Gold Construction Emblem.png",
        backgroundColor: "#080B0E",
      },
    },
    newArchEnabled: true,
    extra: {
      ...(config.extra || {}),
      eas: {
        ...(config.extra?.eas || {}),
        projectId: "b3e90d12-040a-4228-9e89-8008ef5a35a1",
      },
    },
    plugins: [
      ...plugins,
      ["expo-image-picker", {
        photosPermission: "Danat Build lets you choose a banner image for a direct advertising campaign.",
      }],
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
