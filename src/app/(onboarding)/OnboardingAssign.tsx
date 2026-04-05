import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "heroui-native";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import ReceiptRival from "../../components/ReceiptRival";
import { images } from "../../assets/images";

const OnboardingAssign = () => {
  return (
    <SafeAreaWrapper>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ReceiptRival />
        </View>

        <View style={styles.imageSection}>
          <Image
            source={images.onboardingAssign}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footer}>
          <View className="gap-1">
            <Text className="text-foreground text-5xl text-center">
              Know who{" "}
            </Text>
            <Text className="italic text-5xl text-center text-purple-300">
              owes what.
            </Text>
          </View>

          <Text className="text-accent-foreground text-2xl text-center px-1 leading-8">
            Visually assign items to friends in seconds.
          </Text>

          <Button
            size="lg"
            className="w-full rounded-xl"
            onPress={() => router.push("/OnboardingScan")}
          >
            <Button.Label className="text-xl font-semibold">Next</Button.Label>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </Button>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default OnboardingAssign;

const H_PADDING = 24;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: H_PADDING,
  },
  header: {
    flexShrink: 0,
    paddingTop: 8,
    position: "absolute",
    top: 10,
    left: 20,
  },
  imageSection: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  footer: {
    flexShrink: 0,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingTop: 8,
    paddingBottom: 4,
    gap: 20,
  },
});
