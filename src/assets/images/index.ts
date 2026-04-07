import {type ImageSourcePropType } from "react-native";

export const images = {
  onboardingAssign: require("./onboarding_assign.png"),
  onboardingScan: require("./onboarding_scan.png"),
  icon: require("./RR.png"),
  phase1: require("./phase1.png"),
  phase2: require("./phase2.png"),
  phase3: require("./phase3.png"),
  phase4: require("./phase4.png"),
  phase5: require("./phase5.png"),
  phase6: require("./phase6.png"),
  phase7: require("./phase7.png"),
  phase8: require("./phase8.png"),
  phase9: require("./phase9.png"),
  phase10: require("./phase10.png"),
} as const satisfies Record<string, ImageSourcePropType>;

