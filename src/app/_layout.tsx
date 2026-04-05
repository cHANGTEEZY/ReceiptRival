import "react-native-reanimated";
import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HeroUINativeProvider } from "heroui-native";
import "../global.css";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
