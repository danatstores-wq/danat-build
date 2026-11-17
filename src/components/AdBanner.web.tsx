import React from "react";

type Props = {
  enabled: boolean;
};

export default function AdBanner(_props: Props) {
  // AdMob native placements are intentionally disabled on the web build.
  return null;
}
