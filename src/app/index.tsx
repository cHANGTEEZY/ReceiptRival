import "../global.css";
import { Redirect } from "expo-router";
import { store } from "../lib/key-store";

export default function Index() {
  const isOnboardingComplete =
    store.getString("isOnboardingComplete") === "true";

  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)/OnboardingAssign" />;
  }

  return <Redirect href="/(auth)/login" />;
}
