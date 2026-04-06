import { StyleSheet, Text, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import Header from "../../components/Header";
import { authClient } from "../../lib/auth-client";

const profile = () => {
  const { data } = authClient.useSession();

  return (
    <SafeAreaWrapper edges={["left", "right", "bottom"]}>
      <Header>
        <Header.Notification />
        <Header.Profile />
      </Header>

      <View className="items-center justify-center gap-2 mt-8">
        <View className=" items-center justify-center rounded-full h-40 w-40 border-14 border-purple-500 flex-row gap-0.5">
          <Text className="text-foreground text-4xl font-bold">20</Text>
          <Text className="text-foreground text-xl">/</Text>
          <Text className="text-foreground text-xl">20</Text>
        </View>
        <View className="mt-2">
          <Text className="text-center text-foreground text-2xl font-bold">
            {data?.user?.name}
          </Text>
          <Text className="text-center text-foreground text-xl">
            {data?.user?.email}
          </Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default profile;

const styles = StyleSheet.create({});
