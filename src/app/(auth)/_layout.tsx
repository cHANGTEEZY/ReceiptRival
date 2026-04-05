import React from "react";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native/provider";

const AuthLayout = () => {
  return (
    <HeroUINativeProvider>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </HeroUINativeProvider>
  );
};

export default AuthLayout;
