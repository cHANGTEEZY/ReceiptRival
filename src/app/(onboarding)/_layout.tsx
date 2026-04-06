import React, { useEffect, useLayoutEffect, useRef } from "react";
import { ActivityIndicator, BackHandler, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";
import { ONBOARDING } from "./onboarding-theme";

export default function OnboardingLayout() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const didRedirect = useRef(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useLayoutEffect(() => {
    if (isPending || didRedirect.current) return;

    if (session?.user) {
      didRedirect.current = true;
      router.replace("/(tabs)");
      return;
    }

  }, [isPending, session, router]);

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ONBOARDING.bg,
        }}
      >
        <ActivityIndicator color={ONBOARDING.purple} />
      </View>
    );
  }

  if (session?.user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ONBOARDING.bg,
        }}
      >
        <ActivityIndicator color={ONBOARDING.purple} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        contentStyle: { backgroundColor: ONBOARDING.bg },
      }}
    >
      <Stack.Screen name="OnboardingScan" />
      <Stack.Screen name="OnboardingAssign" />
      <Stack.Screen name="OnboardingSettle" />
    </Stack>
  );
}
