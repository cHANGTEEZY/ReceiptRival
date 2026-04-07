import "../global.css";
import { Redirect } from "expo-router";
import AuthSessionSplash from "../components/AuthSessionSplash";
import { store } from "../lib/key-store";
import { authClient } from "../lib/auth-client";

export default function Index() {
  const isOnboardingComplete =
    store.getString("isOnboardingComplete") === "true";

  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)/OnboardingAssign" />;
  }

  return <PostOnboardingIndexRedirect />;
}

function PostOnboardingIndexRedirect() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
