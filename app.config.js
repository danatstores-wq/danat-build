const ANDROID_ADMOB_APP_ID = "ca-app-pub-1622329571366129~7573722234";
const IOS_ADMOB_APP_ID = "ca-app-pub-1622329571366129~8388110450";

module.exports = ({ config }) => {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID || ANDROID_ADMOB_APP_ID;
  const iosAppId = process.env.ADMOB_IOS_APP_ID || IOS_ADMOB_APP_ID;

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
