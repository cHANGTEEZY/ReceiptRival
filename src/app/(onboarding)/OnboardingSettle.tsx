import { View, Text } from "react-native";
import React from "react";
import { store } from "../../lib/key-store";

const OnboardingSettle = () => {
  const handleCompelteOnboarding = () => {
    store.set("isOnboardingComplete", "true");
  };
  return (
    <View>
      <Text>OnboardingSettle</Text>
    </View>
  );
};

export default OnboardingSettle;
