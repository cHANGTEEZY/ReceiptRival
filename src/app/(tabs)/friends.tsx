import { StyleSheet, Text, View } from "react-native";
import React from "react";
import HeaderRoot from "../../components/composition/Header";

const friends = () => {
  return (
    <View className="flex-1 bg-background">
      <HeaderRoot>
        <HeaderRoot.Notification />
        <HeaderRoot.Profile />
      </HeaderRoot>
      <Text>friends</Text>
    </View>
  );
};

export default friends;

const styles = StyleSheet.create({});
