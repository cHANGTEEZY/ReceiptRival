import {
  ActivityIndicator,
  ScrollView,
  Share,
  Text,
  useColorScheme,
  View,
} from "react-native";
import React, { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DetailsHeader from "../../../components/composition/Header/DetailsHeader";
import { Button } from "heroui-native/button";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  formatMoney,
  SplitReceiptSection,
  SplitRivalDetailsSection,
} from "../../../features/Splits/splitDetail";

const SplitDetails = () => {
  const { splitId } = useLocalSearchParams();
  const scheme = useColorScheme();
  const inset = useSafeAreaInsets();
  const iconMuted = scheme === "dark" ? "#fafafa" : "#171717";

  const idParam = useMemo(() => {
    const p =
      typeof splitId === "string"
        ? splitId
        : Array.isArray(splitId)
          ? splitId[0]
          : undefined;
    return p;
  }, [splitId]);

  const data = useQuery(
    api.splits.getSplitDetail,
    idParam ? { splitId: idParam as Id<"splits"> } : "skip",
  );

  const shareLine = useMemo(() => {
    if (!data?.split) return "";
    const s = data.split;
    return `${s.title} — ${formatMoney(s.total)} (${s.location || "Split"})`;
  }, [data]);

  if (idParam === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground/70">Missing split.</Text>
      </View>
    );
  }

  if (data === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (data === null) {
    return (
      <View className="flex-1 bg-background">
        <DetailsHeader title="Split" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-foreground/70">
            This split could not be found.
          </Text>
        </View>
      </View>
    );
  }

  const { split, creatorRow, rivals, settledCount, totalPeople } = data;

  return (
    <View className="flex-1 bg-background">
      <DetailsHeader
        title="Receipt"
        onBack={() => router.back()}
        rightAction={
          <Button
            variant="ghost"
            onPress={() => {
              void Share.share({ message: shareLine });
            }}
          >
            <Button.Label>
              <HugeiconsIcon icon={Share08Icon} color={iconMuted} />
            </Button.Label>
          </Button>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: inset.bottom + 70,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <SplitReceiptSection split={split} />

        <SplitRivalDetailsSection
          settledCount={settledCount}
          totalPeople={totalPeople}
          creatorRow={creatorRow}
          rivals={rivals}
        />
      </ScrollView>
    </View>
  );
};

export default SplitDetails;
