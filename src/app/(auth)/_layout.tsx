import React from "react";
import { Redirect, Stack } from "expo-router";
import AuthSessionSplash from "../../components/AuthSessionSplash";
import { authClient } from "../../lib/auth-client";

const AuthLayout = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
