const TEST_ANDROID_ADMOB_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => {
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
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ANDROID_ADMOB_APP_ID,
          iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_IOS_ADMOB_APP_ID,
        },
      ],
    ],
  };
};
