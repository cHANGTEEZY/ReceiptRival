import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
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
