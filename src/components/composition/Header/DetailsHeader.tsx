import React, { type ReactNode } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export type DetailsHeaderProps = {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

const SIDE_SLOT_CLASS = "w-12 items-center justify-center";

export default function DetailsHeader({
  title,
  onBack,
  rightAction,
}: DetailsHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const iconMuted = scheme === "dark" ? "#a3a3a3" : "#737373";

  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      className="flex-row items-center border-b border-border px-2 pb-3"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className={SIDE_SLOT_CLASS}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={iconMuted} />
        </Pressable>
      </View>

      <View className=" flex-1 items-center px-2">
        <Text className="text-center text-lg font-semibold text-foreground uppercase">
          {title}
        </Text>
      </View>

      <View className={`${SIDE_SLOT_CLASS} min-h-[40px]`}>{rightAction}</View>
    </View>
  );
}
