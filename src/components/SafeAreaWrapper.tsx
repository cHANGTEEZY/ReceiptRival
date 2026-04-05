import React from "react";
import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SafeAreaEdge = "top" | "right" | "bottom" | "left";

type SafeAreaWrapperProps = {
  children: React.ReactNode;
  edges?: SafeAreaEdge[];
} & Pick<ViewProps, "className">;

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
