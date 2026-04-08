import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SplitForm from "../../features/Splits/SplitForm";

export default function NewSplitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "#a3a3a3" : "#737373";

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center gap-3 border-b border-border px-4 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={iconColor} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">New split</Text>
      </View>
      <SplitForm />
    </View>
  );
}
