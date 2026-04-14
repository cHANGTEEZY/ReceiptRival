import React from "react";
import { Stack } from "expo-router";
import { RequireGuest } from "../../lib/auth-middleware";

const AuthLayout = () => {
  return (
    <RequireGuest>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </RequireGuest>
  );
};

export default AuthLayout;
