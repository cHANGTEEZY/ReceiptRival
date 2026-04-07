import React from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Full-screen placeholder while auth session is resolving.
 * Avoids flashing login (or tabs) before we know the user state.
 */
export default function AuthSessionSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" />
    </View>
  );
}
