type Props = {
  enabled: boolean;
  safeToShow: boolean;
};

export default function AdInterstitial(_props: Props) {
  // AdMob interstitials are native-only and are not shown in the web build.
  return null;
}
