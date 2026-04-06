import { StyleSheet, Text, View } from "react-native";
import React from "react";
import HeaderRoot from "../../components/Header";

const splits = () => {
  return (
    <View className="flex-1 bg-background">
      <HeaderRoot>
        <HeaderRoot.Notification />
        <HeaderRoot.Profile />
      </HeaderRoot>
      <Text>splits</Text>
    </View>
  );
};

export default splits;

const styles = StyleSheet.create({});
