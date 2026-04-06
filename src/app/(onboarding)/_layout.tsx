import React from "react";
import { Stack, useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";
import { store } from "../../lib/key-store";

const OnboaringLayout = () => {
  const { data: session } = authClient.useSession();

  const router = useRouter();

  const isOnboardingComplete = store.getString("isOnboardingComplete");

  if (isOnboardingComplete) {
    return router.replace("/(auth)");
  }

  if (session?.session.token) {
    return router.replace("/(tabs)");
  }

  return (
    <Stack>
      <Stack.Screen name="OnboardingScan" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingAssign" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingSettle" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OnboaringLayout;
