import React from "react";
import { Text, useColorScheme, View } from "react-native";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { PressableFeedback } from "heroui-native";
import { twMerge } from "tailwind-merge";

const ICON_STROKE = 1.5;

export type ProfileRowProps = {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  className?: string;
};

/** Matches home headline accent: purple-300 (dark) / purple-800 (light). */
function useProfileAccentColors() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    icon: isDark ? "#ffffff" : "#6b21a8",
    chevron: isDark ? "rgba(216, 180, 254, 0.55)" : "rgba(107, 33, 168, 0.5)",
  };
}

export function ProfileRow({
  icon,
  label,
  onPress,
  showChevron = true,
  className,
}: ProfileRowProps) {
  const { icon: iconColor, chevron: chevronColor } = useProfileAccentColors();

  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={twMerge("rounded-3xl px-2", className)}
    >
      <PressableFeedback.Highlight />
      <View className="flex-row items-center py-3.5">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-accent/12 px-2">
          <HugeiconsIcon
            icon={icon}
            size={22}
            color={iconColor}
            strokeWidth={ICON_STROKE}
          />
        </View>
        <Text className="text-foreground ml-4 flex-1 text-base font-medium">
          {label}
        </Text>
        {showChevron ? (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            color={chevronColor}
            strokeWidth={ICON_STROKE}
          />
        ) : null}
      </View>
    </PressableFeedback>
  );
}

export default ProfileRow;
