import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderRoot from "../../components/Header";
import ListRowCard from "../../components/ListRowCard";
import { Button, Card, InputGroup } from "heroui-native";
import { ArrowUp01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { formatUsd } from "../../lib/format-currency";
import { SPLITS_ACTIVITY_ROWS } from "../../lib/data";
import { getActivityCategoryIcon } from "../../lib/activity-category-icon";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const SplitsScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const inset = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const splits = useQuery(api.splits.getAllSplits) ?? [];
  console.log("splits", JSON.stringify(splits, null, 2));

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
                $1,240.50
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full bg-lime-400/15 p-1">
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    size={14}
                    color="#a3e635"
                  />
                </View>
                <Text className="text-sm font-medium text-lime-400">+12%</Text>
                <Text className="text-sm text-foreground/50">
                  from last week
                </Text>
              </View>
            </Card.Body>
            <Card.Footer className="border border-border bg-background-secondary px-4 py-3 rounded-2xl">
              <View className="flex-row items-center justify-between ">
                <View className="flex-row gap-4 px-3 ">
                  <View className="gap-0.5">
                    <Text className="text-xs text-foreground/50">Pending</Text>
                    <Text className="text-base font-semibold text-foreground">
                      3 splits
                    </Text>
                  </View>
                  <View className="w-px bg-border" style={{ height: "100%" }} />
                  <View className="gap-0.5">
                    <Text className="text-xs text-foreground/50">People</Text>
                    <Text className="text-base font-semibold text-foreground">
                      5 owing
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

          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">
              All splits
            </Text>
          </View>

          <View className="gap-3">
            {SPLITS_ACTIVITY_ROWS.map((item) => {
              const categoryIcon = getActivityCategoryIcon(
                item.subtitle.category,
              );
              const iconMuted = isDark ? "#c4c4c4" : "#525252";
              const metaLine = `${item.subtitle.timeStamp} • ${item.subtitle.category}`;
              const splitLabel = `split ${item.split}`.toUpperCase();

              return (
                <ListRowCard
                  key={item.id}
                  rowVariant="leaderboard"
                  variant="secondary"
                  className="border-border bg-background px-0 py-0"
                  bodyClassName="px-3 py-3"
                  isPressable
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
    </View>
  );
};

export default SplitsScreen;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
