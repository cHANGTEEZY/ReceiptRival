import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SafeAreaEdge = "top" | "right" | "bottom" | "left";

type SafeAreaWrapperProps = {
  children: React.ReactNode;
  edges?: SafeAreaEdge[];
} & Pick<ViewProps, "className">;

type KeyboardAvoidingWrapperProps = SafeAreaWrapperProps & {
  /** iOS only; use when a visible header sits above this screen (safe area is already applied). */
  keyboardVerticalOffset?: number;
} & Pick<
    ScrollViewProps,
    | "contentContainerStyle"
    | "keyboardShouldPersistTaps"
    | "showsVerticalScrollIndicator"
    | "keyboardDismissMode"
  >;

const ALL_EDGES: SafeAreaEdge[] = ["top", "right", "bottom", "left"];

export default function SafeAreaWrapper({
  children,
  edges = ALL_EDGES,
  className,
}: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
  };

  return (
    <View className={`flex-1 bg-background ${className ?? ""}`}>
      <View className="flex-1" style={paddingStyle}>
        {children}
      </View>
    </View>
  );
}

export function KeyboardAvoidingWrapper({
  children,
  className,
  edges,
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  keyboardDismissMode,
}: KeyboardAvoidingWrapperProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardOpen(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaWrapper edges={edges} className={className}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}
      >
        <ScrollView
          scrollEnabled={keyboardOpen}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardDismissMode={keyboardDismissMode}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
