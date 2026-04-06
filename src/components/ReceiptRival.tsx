import { StyleSheet, Text, View } from "react-native";
import React from "react";

type ReceiptRivalProps = {
  /** When set, uses this color instead of theme purple (e.g. onboarding hex). */
  brandColor?: string;
};

export default function ReceiptRival({ brandColor }: ReceiptRivalProps) {
  return (
    <View>
      <Text
        style={[styles.text, brandColor ? { color: brandColor } : undefined]}
        className={brandColor ? "text-3xl" : "text-3xl text-purple-300"}
      >
        ReceiptRival
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontStyle: "italic",
    fontWeight: "600",
  },
});
