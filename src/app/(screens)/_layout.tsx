import { Stack } from "expo-router";
import React from "react";
import { RequireAuth } from "../../lib/auth-middleware";

const ScreenLayout = () => {
  return (
    <RequireAuth>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ReviewItem" />
        <Stack.Screen name="Notifications" />
        <Stack.Screen name="NewSplit" />
      </Stack>
    </RequireAuth>
  );
};

export default ScreenLayout;
