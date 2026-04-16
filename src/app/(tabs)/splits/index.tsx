import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderRoot from "../../../components/Header";
import ListRowCard from "../../../components/ListRowCard";
import { Button, Card, InputGroup } from "heroui-native";
import { ArrowUp01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { getActivityCategoryIcon } from "../../../lib/activity-category-icon";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

type TabKey = "all" | "assigned";

const SplitsScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const inset = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const [tab, setTab] = useState<TabKey>("all");

  const mySplits = useQuery(api.splits.getMySplits);
  const assignedSplits = useQuery(api.splits.getAssignedSplits);

  const pendingCount = useMemo(() => {
    if (!mySplits) return 0;
    return mySplits.filter((s) => s.completion_status === "pending").length;
  }, [mySplits]);

  const myTotalPending = useMemo(() => {
    if (!mySplits) return 0;
    return mySplits
      .filter((s) => s.completion_status === "pending")
      .reduce((a, s) => a + s.total, 0);
  }, [mySplits]);

  const listLoading = mySplits === undefined || assignedSplits === undefined;

  return (
    <View className="flex-1 bg-background">
      <HeaderRoot>
        <HeaderRoot.Notification />
        <HeaderRoot.Profile />
      </HeaderRoot>

      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: inset.bottom + 50 }}
      >
        <View className="gap-4 p-4">
          <View className="gap-1">
            <Text className="text-sm font-medium uppercase tracking-widest text-foreground/40">
              Outstanding balance
            </Text>
            <Text className="text-3xl font-bold text-foreground">
              The world owes you.
            </Text>
          </View>

          <Card className="overflow-hidden">
            <Card.Body className="gap-1 pb-4 pt-4">
              <Text className="text-5xl font-bold tracking- text-purple-400">
                {formatMoney(myTotalPending)}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full bg-lime-400/15 p-1">
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    size={14}
                    color="#a3e635"
                  />
                </View>
                <Text className="text-sm font-medium text-lime-400">
                  Pending
                </Text>
                <Text className="text-sm text-foreground/50">
                  across your open splits
                </Text>
              </View>
            </Card.Body>
            <Card.Footer className="border border-border bg-background-secondary px-4 py-3 rounded-2xl">
              <View className="flex-row items-center justify-between ">
                <View className="flex-row gap-4 px-3 ">
                  <View className="gap-0.5">
                    <Text className="text-xs text-foreground/50">Pending</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {pendingCount} splits
                    </Text>
                  </View>
                  <View className="w-px bg-border" style={{ height: "100%" }} />
                  <View className="gap-0.5">
                    <Text className="text-xs text-foreground/50">Assigned</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {assignedSplits?.length ?? "—"} shares
                    </Text>
                  </View>
                </View>
                <Button onPress={() => router.push("/NewSplit")}>
                  <Button.Label>+ New split</Button.Label>
                </Button>
              </View>
            </Card.Footer>
          </Card>

          <InputGroup>
            <InputGroup.Prefix>
              <HugeiconsIcon
                icon={Search01Icon}
                size={20}
                color={isDark ? "#ffffff" : "#000000"}
              />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Search your splits…" />
          </InputGroup>

          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: tab === "all" }}
              onPress={() => setTab("all")}
              className={`flex-1 rounded-xl border px-3 py-2.5 ${
                tab === "all"
                  ? "border-accent bg-accent/15"
                  : "border-border bg-background-secondary"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  tab === "all" ? "text-accent" : "text-foreground/80"
                }`}
              >
                All splits
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: tab === "assigned" }}
              onPress={() => setTab("assigned")}
              className={`flex-1 rounded-xl border px-3 py-2.5 ${
                tab === "assigned"
                  ? "border-accent bg-accent/15"
                  : "border-border bg-background-secondary"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  tab === "assigned" ? "text-accent" : "text-foreground/80"
                }`}
              >
                Assigned splits
              </Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {listLoading ? (
              <Text className="text-sm text-foreground/60">
                Loading splits…
              </Text>
            ) : tab === "all" ? (
              mySplits.length === 0 ? (
                <Text className="text-sm text-foreground/60">
                  No splits yet. Create one to get started.
                </Text>
              ) : (
                mySplits.map((item) => {
                  const categoryIcon = getActivityCategoryIcon(item.category);
                  const iconMuted = isDark ? "#c4c4c4" : "#525252";
                  const metaLine = `${item.date ?? "—"} • ${item.category}`;
                  const statusLabel = item.completion_status.toUpperCase();

                  return (
                    <ListRowCard
                      key={item._id}
                      rowVariant="leaderboard"
                      variant="secondary"
                      className="border-border bg-background px-0 py-0"
                      bodyClassName="px-3 py-3"
                      isPressable
                      onPress={() => router.push(`/splits/${item._id}`)}
                    >
                      <ListRowCard.Icon
                        alt={`${item.title}, ${item.category}`}
                        color="default"
                        className="rounded-2xl"
                      >
                        <Ionicons
                          name={categoryIcon}
                          size={24}
                          color={iconMuted}
                        />
                      </ListRowCard.Icon>

                      <ListRowCard.Content>
                        <ListRowCard.Title
                          numberOfLines={2}
                          className="flex-row justify-center gap-1 text-foreground"
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
                            {formatMoney(item.total)}
                          </Text>
                        </ListRowCard.Item>
                        <ListRowCard.Item className="pt-1">
                          <Text className="text-base font-semibold uppercase tracking-wide text-lime-400">
                            {statusLabel}
                          </Text>
                        </ListRowCard.Item>
                      </ListRowCard.Trailing>
                    </ListRowCard>
                  );
                })
              )
            ) : assignedSplits.length === 0 ? (
              <Text className="text-sm text-foreground/60">
                Nothing assigned to you yet.
              </Text>
            ) : (
              assignedSplits.map(({ split, assignedAmount }) => {
                const categoryIcon = getActivityCategoryIcon(split.category);
                const iconMuted = isDark ? "#c4c4c4" : "#525252";
                const metaLine = `${split.date ?? "—"} • ${split.category}`;

                return (
                  <ListRowCard
                    key={split._id}
                    rowVariant="leaderboard"
                    variant="secondary"
                    className="border-border bg-background px-0 py-0"
                    bodyClassName="px-3 py-3"
                    isPressable
                    onPress={() => router.push(`/splits/${split._id}`)}
                  >
                    <ListRowCard.Icon
                      alt={`${split.title}, ${split.category}`}
                      color="default"
                      className="rounded-2xl"
                    >
                      <Ionicons
                        name={categoryIcon}
                        size={24}
                        color={iconMuted}
                      />
                    </ListRowCard.Icon>

                    <ListRowCard.Content>
                      <ListRowCard.Title
                        numberOfLines={2}
                        className="flex-row justify-center gap-1 text-foreground"
                      >
                        <Text className="text-xl">{split.title}</Text>
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
                        <Text className="text-right text-foreground">
                          {formatMoney(assignedAmount)}
                        </Text>
                        <Text className="text-right text-xs text-foreground/50">
                          of {formatMoney(split.total)} bill
                        </Text>
                      </ListRowCard.Item>
                      <ListRowCard.Item className="pt-1">
                        <Text className="text-base font-semibold uppercase tracking-wide text-lime-400">
                          YOUR SHARE
                        </Text>
                      </ListRowCard.Item>
                    </ListRowCard.Trailing>
                  </ListRowCard>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SplitsScreen;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
