/**
 * Speed dial modeled after React Native Paper’s FAB.Group:
 * https://oss.callstack.com/react-native-paper/docs/components/FAB/FABGroup
 *
 * Built with heroui-native (Button, Surface, Portal) and Hugeicons — no Paper dependency.
 */
import React, { useId } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  HugeiconsIcon,
  type IconSvgElement,
} from "@hugeicons/react-native";
import { Button, Portal, Surface } from "heroui-native";
import type { FabGroupAction } from "./types";

const ICON_STROKE = 1.5;

type MainFabVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-soft";

const DEFAULT_MAIN_FAB_CLASS =
  "h-[50px] w-[50px] rounded-full border border-white/30 bg-white/15";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When false, nothing is rendered (Paper `visible`). @default true */
  visible?: boolean;
  iconClosed: IconSvgElement;
  iconOpen: IconSvgElement;
  actions: FabGroupAction[];
  backdropColor?: string;
  /** Extra space below safe-area (adds to insets). @default 24 */
  bottomInsetExtra?: number;
  /** Horizontal inset from the trailing edge. @default 20 */
  trailingInset?: number;
  /** Distinct Portal slot name if multiple groups mount. */
  portalName?: string;
  accessibilityLabelClosed?: string;
  accessibilityLabelOpen?: string;
  className?: string;
  /** Root overlay (Uniwind). */
  style?: StyleProp<ViewStyle>;
  /** Paper-style `fabStyle` — applied to the main FAB wrapper. */
  fabStyle?: StyleProp<ViewStyle>;
  /** Main FAB variant (e.g. `primary` on light surfaces). @default secondary */
  mainFabVariant?: MainFabVariant;
  /** Override main FAB Uniwind classes. */
  mainFabClassName?: string;
  /** Main FAB icon color (Hugeicons). @default #ffffff */
  mainFabIconColor?: string;
};

export default function FabGroup({
  open,
  onOpenChange,
  visible = true,
  iconClosed,
  iconOpen,
  actions,
  backdropColor = "rgba(0,0,0,0.45)",
  bottomInsetExtra = 24,
  trailingInset = 20,
  portalName: portalNameProp,
  accessibilityLabelClosed = "More actions",
  accessibilityLabelOpen = "Close menu",
  className,
  style,
  fabStyle,
  mainFabVariant = "secondary",
  mainFabClassName = DEFAULT_MAIN_FAB_CLASS,
  mainFabIconColor = "#ffffff",
}: Props) {
  const insets = useSafeAreaInsets();
  const reactId = useId().replace(/:/g, "");
  const portalName = portalNameProp ?? `fab-group-${reactId}`;

  const bottom = insets.bottom + bottomInsetExtra;

  if (!visible) {
    return null;
  }

  return (
    <Portal name={portalName}>
      <View
        className={className}
        style={[styles.overlayRoot, style]}
        pointerEvents="box-none"
      >
        {open ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={() => onOpenChange(false)}
            style={[styles.backdrop, { backgroundColor: backdropColor }]}
          />
        ) : null}

        <View
          style={[
            styles.anchor,
            { right: trailingInset, bottom },
            fabStyle,
          ]}
          pointerEvents="box-none"
        >
          {open && actions.length > 0 ? (
            <View style={styles.actionStack}>
              {actions.map((action) => (
                <View key={action.id} style={styles.actionRow}>
                  {action.label ? (
                    <Surface
                      variant="secondary"
                      className="rounded-xl border border-border/80 px-3 py-2 shadow-sm"
                    >
                      <Text className="text-sm font-medium text-foreground">
                        {action.label}
                      </Text>
                    </Surface>
                  ) : null}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="primary"
                    feedbackVariant="scale-highlight"
                    className="h-12 w-12 rounded-full shadow-md"
                    accessibilityLabel={
                      action.accessibilityLabel ?? action.label ?? action.id
                    }
                    accessibilityHint={action.accessibilityHint}
                    onPress={() => {
                      onOpenChange(false);
                      action.onPress();
                    }}
                  >
                    <HugeiconsIcon
                      icon={action.icon}
                      size={22}
                      color="#fafafa"
                      strokeWidth={ICON_STROKE}
                    />
                  </Button>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            isIconOnly
            size="md"
            variant={mainFabVariant}
            feedbackVariant="scale-highlight"
            className={mainFabClassName}
            accessibilityLabel={
              open ? accessibilityLabelOpen : accessibilityLabelClosed
            }
            onPress={() => onOpenChange(!open)}
          >
            <HugeiconsIcon
              icon={open ? iconOpen : iconClosed}
              size={26}
              color={mainFabIconColor}
              strokeWidth={ICON_STROKE}
            />
          </Button>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  anchor: {
    position: "absolute",
    alignItems: "flex-end",
  },
  actionStack: {
    marginBottom: 12,
    gap: 12,
    alignItems: "flex-end",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-end",
  },
});
