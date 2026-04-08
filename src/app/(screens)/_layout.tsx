import { Slot, Stack } from "expo-router";
import React from "react";

const ScreenLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReviewItem" />
      <Stack.Screen name="Notifications" />
      <Stack.Screen name="NewSplit" />
    </Stack>
  );
};

export default ScreenLayout;
