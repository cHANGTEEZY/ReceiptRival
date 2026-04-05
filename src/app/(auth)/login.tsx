import { router } from "expo-router";
import { Button } from "heroui-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container} className="bg-background">
      <Button onPress={() => router.push("/onboarding-auth")}>
        <Button.Label>OnBoarding</Button.Label>
      </Button>
      <Button onPress={() => router.push("/signup")}>
        <Button.Label>Signup</Button.Label>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
  },
});
