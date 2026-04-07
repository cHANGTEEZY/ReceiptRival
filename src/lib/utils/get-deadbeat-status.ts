import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type ColorScheme = "light" | "dark" | null | undefined;

type DeadbeatStatus = {
  colorClassName: string;
  iconName: IoniconName;
  iconColor: string;
  vibeLabel: string;
};

export function getDeadbeatStatus(
  amount: number,
  colorScheme?: ColorScheme,
): DeadbeatStatus {
  const iconColor = colorScheme === "dark" ? "#e5e7eb" : "#111827";

  if (amount < 100) {
    return {
      colorClassName: "text-green-500",
      iconName: "sparkles-outline",
      iconColor,
      vibeLabel: "certified angel",
    };
  }

  if (amount < 500) {
    return {
      colorClassName: "text-lime-500",
      iconName: "happy-outline",
      iconColor,
      vibeLabel: "still chill",
    };
  }

  if (amount < 1000) {
    return {
      colorClassName: "text-yellow-500",
      iconName: "cafe-outline",
      iconColor,
      vibeLabel: "oweing but make it casual",
    };
  }

  if (amount < 5000) {
    return {
      colorClassName: "text-orange-500",
      iconName: "flame-outline",
      iconColor,
      vibeLabel: "financially suspicious",
    };
  }

  return {
    colorClassName: "text-red-500",
    iconName: "skull-outline",
    iconColor,
    vibeLabel: "absolute menace",
  };
}