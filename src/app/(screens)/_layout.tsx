import { Slot } from "expo-router";
import React from "react";

const ScreenLayout = () => {
  return <Slot screenOptions={{ headerShown: false }} />;
};

export default ScreenLayout;
