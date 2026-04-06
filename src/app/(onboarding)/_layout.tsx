import React, { useLayoutEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";
import { store } from "../../lib/key-store";

export default function OnboardingLayout() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isOnboardingComplete = store.getString("isOnboardingComplete");
  const didRedirect = useRef(false);

  //run after the component is mounted
  useLayoutEffect(() => {
    if (isPending || didRedirect.current) return;

    if (session?.user) {
      didRedirect.current = true;
      router.replace("/(tabs)");
      return;
    }

    if (isOnboardingComplete) {
      didRedirect.current = true;
      router.replace("/(auth)/login");
    }
  }, [isPending, isOnboardingComplete, session, router]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isOnboardingComplete || session?.user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="OnboardingScan" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingAssign" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingSettle" options={{ headerShown: false }} />
    </Stack>
  );
}
