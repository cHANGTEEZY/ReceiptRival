import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const OnboaringLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="OnboardingScan" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingAssign" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingSettle" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OnboaringLayout;
