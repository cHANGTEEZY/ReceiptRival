import "../global.css";
import { Redirect } from "expo-router";
import { store } from "../lib/key-store";

export default function Index() {
  const isLoggedIn = false;
  const isOnboardingComplete = store.getString("isOnboardingComplete");

  // if (!isLoggedIn && !isOnboardingComplete) {
  //   return <Redirect href="/(onboarding)/OnboardingAssign" />;
  // }

  return <Redirect href="/(auth)/login" />;
}
