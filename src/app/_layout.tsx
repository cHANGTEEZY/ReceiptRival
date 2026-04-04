import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import "../global.css";

import { Slot } from "expo-router";

export default function Layout() {
  return  <GestureHandlerRootView style={{ flex: 1 }}>
          <HeroUINativeProvider>
    <Slot />
    </HeroUINativeProvider>
</GestureHandlerRootView>
}
