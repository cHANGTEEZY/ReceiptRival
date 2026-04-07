import React, { type ComponentProps } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client";
import { formatSignedUsd, formatUsd } from "../../lib/format-currency";
import HeaderRoot from "../../components/Header";
import { MarketIndexRow } from "../../components/MarketIndexRow";
import { Ionicons } from "@expo/vector-icons";
import { DEADBEAT_LEADERBOARD, RECENT_ACTIVITIES } from "../../lib/data";
import ListRowCard from "../../components/ListRowCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "heroui-native";
import { getDeadbeatStatus } from "../../lib/utils/get-deadbeat-status";

const OWED_AMOUNT = 100_100;
const OWE_AMOUNT = 100_100;
const OWED_NET_CHANGE = 1_240;
const OWE_NET_CHANGE = 890;

const OWED_SERIES = [0.35, 0.42, 0.38, 0.5, 0.48, 0.62, 0.58, 0.78, 0.74, 0.92];
const OWE_SERIES = [0.9, 0.82, 0.85, 0.72, 0.75, 0.6, 0.65, 0.52, 0.48, 0.4];

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function getActivityCategoryIcon(category: string): IoniconName {
  const key = category.trim().toLowerCase();
  if (
    key === "food" ||
    key === "dinner" ||
    key === "lunch" ||
    key === "restaurant"
  ) {
    return "restaurant-outline";
  }
  if (key === "movie" || key === "movies" || key === "entertainment") {
    return "film-outline";
  }
  if (key === "coffee" || key === "drinks" || key === "bar") {
    return "cafe-outline";
  }
  if (key === "transport" || key === "travel" || key === "rideshare") {
    return "car-outline";
  }
  if (key === "shopping" || key === "retail" || key === "groceries") {
    return "bag-outline";
  }
  if (key === "gas" || key === "fuel") {
    return "color-fill-outline";
  }
  return "receipt-outline";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();

  const colorScheme = useColorScheme();
  const inset = useSafeAreaInsets();

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: inset.bottom + 80 }}
      >
        <View className="px-4 pt-3">
          <Text className="text-foreground text-3xl font-bold">
            Hey {firstName}
          </Text>
          <Text className="text-overlay-foreground mt-1 text-lg">
            The world owes you.
          </Text>
        </View>

        <View className="my-4 px-4">
          <View className="overflow-hidden rounded-2xl border border-border bg-background-secondary px-4">
            <MarketIndexRow
              title="You're owed"
              subtitle="Money owed to you from splits and shared receipts"
              value={formatUsd(OWED_AMOUNT)}
              changeText={formatSignedUsd(OWED_NET_CHANGE, "+")}
              positive
              series={OWED_SERIES}
            />
            <View className="h-px bg-neutral-800" />
            <MarketIndexRow
              title="You owe"
              subtitle="Your share to friends — settle up to clear the slate"
              value={formatUsd(OWE_AMOUNT)}
              changeText={formatSignedUsd(OWE_NET_CHANGE, "-")}
              positive={false}
              series={OWE_SERIES}
            />
          </View>
        </View>

        <View>
          <View className="my-4 flex-row items-center justify-between px-4">
            <Text className="text-foreground text-2xl font-bold">
              Deadbeat Leaderboard
            </Text>

            <Text
              className={`text-base ${
                colorScheme === "dark" ? "text-purple-300" : "text-purple-800"
              }`}
            >
              View All
            </Text>
          </View>

          <View className="gap-3 px-4 pb-4">
            {DEADBEAT_LEADERBOARD.map((item) => {
              const status = getDeadbeatStatus(item.amount, colorScheme);

              return (
                <ListRowCard
                  key={item.id}
                  rowVariant="leaderboard"
                  variant="secondary"
                  isPressable
                  feedbackVariant="scale-ripple"
                  className="border-border bg-background px-0 py-0"
                  bodyClassName="px-3 py-3"
                >
                  <ListRowCard.Icon alt={item.name} color="default">
                    {getInitials(item.name)}
                  </ListRowCard.Icon>

                  <ListRowCard.Content>
                    <ListRowCard.Title
                      numberOfLines={2}
                      className="flex-row items-center gap-1 text-foreground justify-center"
                    >
                      <Text className="text-xl">{item.name} </Text>
                    </ListRowCard.Title>
                    <ListRowCard.Subtitle
                      numberOfLines={1}
                      className="text-foreground/80"
                    >
                      {item.subtitle}
                    </ListRowCard.Subtitle>
                  </ListRowCard.Content>

                  <ListRowCard.Trailing>
                    <ListRowCard.Item>
                      <Text className={cn(status.colorClassName)}>
                        {formatUsd(item.amount)}
                      </Text>
                    </ListRowCard.Item>

                    <ListRowCard.Item className="pt-1">
                      <Ionicons
                        name={status.iconName}
                        size={24}
                        color={status.iconColor}
                      />
                    </ListRowCard.Item>
                  </ListRowCard.Trailing>
                </ListRowCard>
              );
            })}
          </View>

          <View className="my-4 px-4">
            <Text className="text-foreground text-2xl font-bold">
              Recent Activities
            </Text>
          </View>

          <View className="gap-3 px-4 pb-4">
            {RECENT_ACTIVITIES.map((item) => {
              const categoryIcon = getActivityCategoryIcon(
                item.subtitle.category,
              );
              const iconMuted = colorScheme === "dark" ? "#c4c4c4" : "#525252";
              const metaLine = `${item.subtitle.timeStamp} • ${item.subtitle.category}`;
              const splitLabel = `split ${item.split}`.toUpperCase();

              return (
                <ListRowCard
                  key={item.id}
                  rowVariant="leaderboard"
                  variant="secondary"
                  className="border-border bg-background px-0 py-0"
                  bodyClassName="px-3 py-3"
                >
                  <ListRowCard.Icon
                    alt={`${item.title}, ${item.subtitle.category}`}
                    color="default"
                    className="rounded-2xl"
                  >
                    <Ionicons name={categoryIcon} size={24} color={iconMuted} />
                  </ListRowCard.Icon>

                  <ListRowCard.Content>
                    <ListRowCard.Title
                      numberOfLines={2}
                      className="flex-row items-center gap-1 justify-center text-foreground"
                    >
                      <Text className="text-xl">{item.title}</Text>
                    </ListRowCard.Title>
                    <ListRowCard.Subtitle
                      numberOfLines={1}
                      className="text-foreground/80"
                    >
                      {metaLine}
                    </ListRowCard.Subtitle>
                  </ListRowCard.Content>

                  <ListRowCard.Trailing>
                    <ListRowCard.Item>
                      <Text className="text-foreground">
                        {formatUsd(item.amount)}
                      </Text>
                    </ListRowCard.Item>
                    <ListRowCard.Item className="pt-1">
                      <Text className="text-base font-semibold uppercase tracking-wide text-lime-400">
                        {splitLabel}
                      </Text>
                    </ListRowCard.Item>
                  </ListRowCard.Trailing>
                </ListRowCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open camera"
        onPress={() => router.push("/camera")}
        className="absolute z-50 h-14 w-14 items-center justify-center rounded-full bg-gray-600 active:opacity-90"
        style={{
          bottom: inset.bottom + 64,
          right: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <Ionicons name="camera" size={26} color="#ffffff" />
      </Pressable>
    </View>
  );
}
