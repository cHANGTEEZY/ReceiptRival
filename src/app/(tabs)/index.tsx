import React from "react";
import { ScrollView, Text, View } from "react-native";
import { authClient } from "../../lib/auth-client";
import { formatSignedUsd } from "../../lib/format-currency";
import HeaderRoot from "../../components/Header";
import { Card } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

const OWED_AMOUNT = 100_100;
const OWE_AMOUNT = 100_100;

export default function HomeScreen() {
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();

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

  const { user } = session;
  const firstName = user?.name?.trim()?.split(/\s+/)[0] ?? "there";

  return (
    <View className="flex-1 bg-background">
      <HeaderRoot>
        <HeaderRoot.Notification />
        <HeaderRoot.Profile />
      </HeaderRoot>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-2 pt-3">
          <Text className="text-foreground text-3xl font-bold">
            Hey {firstName}
          </Text>
          <Text className="text-muted-foreground mt-1 text-lg">
            The world owes you.
          </Text>
        </View>

        <View className="gap-3 px-4 pb-6">
          <Card className="overflow-hidden rounded-2xl border border-border bg-accent-hover">
            <Card.Body className="flex-row items-center justify-between gap-4 p-4">
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  You&apos;re owed
                </Text>
                <Text className="text-3xl font-bold text-emerald-400">
                  {formatSignedUsd(OWED_AMOUNT, "+")}
                </Text>
                <Text className="text-foreground text-xs">
                  Money owed to you from splits
                </Text>
              </View>
              <View className="rounded-2xl bg-emerald-500/15 px-3 py-3">
                <Ionicons name="trending-up" size={28} color="#34d399" />
              </View>
            </Card.Body>
          </Card>

          <Card className="overflow-hidden rounded-2xl border border-border bg-card/80">
            <Card.Body className="flex-row items-center justify-between gap-4 p-4">
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  You owe
                </Text>
                <Text className="text-3xl font-bold text-red-400">
                  {formatSignedUsd(OWE_AMOUNT, "-")}
                </Text>
                <Text className="text-foreground text-xs">
                  Your share to settle up
                </Text>
              </View>
              <View className="rounded-2xl bg-red-500/15 px-3 py-3">
                <Ionicons name="trending-down" size={28} color="#f87171" />
              </View>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
