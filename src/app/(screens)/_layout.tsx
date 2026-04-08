import { Slot, Stack } from "expo-router";
import React from "react";

const ScreenLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="ReviewItem" />
      <Stack.Screen name="Notifications" />
    </Stack>
  );
};

export default ScreenLayout;
