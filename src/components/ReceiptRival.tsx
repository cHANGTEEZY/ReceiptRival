import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ReceiptRival = () => {
  return (
    <View>
      <Text style={styles.text} className="text-3xl  text-purple-300">
        ReceiptRival
      </Text>
    </View>
  );
};

export default ReceiptRival;

const styles = StyleSheet.create({
  text: {
    fontStyle: "italic",
    fontWeight: "600",
  },
});
