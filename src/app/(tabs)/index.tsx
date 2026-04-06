import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "../../lib/auth-client";

export default function HomeScreen() {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();

  console.log("User session data is", JSON.stringify(session, null, 2));

  if (sessionPending) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-muted-foreground">Loading session…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-foreground text-lg font-semibold">
          Not signed in
        </Text>
        {sessionError ? (
          <Text className="text-destructive mt-2 text-sm">
            {sessionError.message}
          </Text>
        ) : null}
      </View>
    );
  }

  const { user, session: sess } = session;

  return (
    <ScrollView className="flex-1 bg-background">
      <Text className="text-foreground text-2xl font-bold">Home</Text>

      <View className="gap-1 rounded-xl border border-border p-4">
        <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          Better Auth session (useSession)
        </Text>
        <Text className="text-foreground font-medium">
          {user.name?.trim() ? user.name : user.email}
        </Text>
        <Text className="text-muted-foreground text-sm">{user.email}</Text>
        {user.id ? (
          <Text className="text-muted-foreground font-mono text-xs">
            user.id: {user.id}
          </Text>
        ) : null}
        {sess?.id ? (
          <Text className="text-muted-foreground font-mono text-xs">
            session.id: {sess.id}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
