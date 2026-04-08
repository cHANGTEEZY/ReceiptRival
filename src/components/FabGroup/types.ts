import type { IconSvgElement } from "@hugeicons/react-native";

/**
 * One speed-dial action (Paper FAB.Group-style `actions[]` item, with Hugeicons).
 */
export type FabGroupAction = {
  id: string;
  icon: IconSvgElement;
  /** Optional text beside the mini FAB when open. */
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};
