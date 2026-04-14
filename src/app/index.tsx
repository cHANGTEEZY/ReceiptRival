import "../global.css";
import { Redirect } from "expo-router";
import AuthSessionSplash from "../components/AuthSessionSplash";
import { useAuthSession } from "../lib/auth-middleware";
import { store } from "../lib/key-store";

export default function Index() {
  const isOnboardingComplete =
    store.getString("isOnboardingComplete") === "true";

  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)/OnboardingAssign" />;
  }

  return <PostOnboardingIndexRedirect />;
}

function PostOnboardingIndexRedirect() {
  const { data: session, isPending } = useAuthSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
