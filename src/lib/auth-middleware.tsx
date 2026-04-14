import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import AuthSessionSplash from "../components/AuthSessionSplash";
import { authClient } from "./auth-client";

/**
 * Single place for session reads. Expo’s `app/+middleware.tsx` is server-only
 * and is not part of the React tree on native — use these gates in layouts instead.
 */
export function useAuthSession() {
  return authClient.useSession();
}

type GateProps = { children: ReactNode };

/** Logged-in users only (tabs, modal screens, etc.). */
export function RequireAuth({ children }: GateProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

/** Logged-out users only (login / signup). Logged-in users go to the app. */
export function RequireGuest({ children }: GateProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
