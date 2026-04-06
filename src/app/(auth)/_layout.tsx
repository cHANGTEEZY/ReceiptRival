import React from "react";
import { Stack, useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";

const AuthLayout = () => {
  const { data: session } = authClient.useSession();

  const router = useRouter();

  if (session?.session.token) {
    return router.replace("/(tabs)");
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
