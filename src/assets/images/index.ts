import {type ImageSourcePropType } from "react-native";

export const images = {
  onboardingAssign: require("./onboarding_assign.png"),
  onboardingScan: require("./onboarding_scan.png"),
  icon: require("./RR.png"),
} as const satisfies Record<string, ImageSourcePropType>;

