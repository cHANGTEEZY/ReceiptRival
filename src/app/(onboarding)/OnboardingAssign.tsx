import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "heroui-native";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import ReceiptRival from "../../components/ReceiptRival";
import { images } from "../../assets/images";
import { ONBOARDING } from "./onboarding-theme";

const OnboardingAssign = () => {
  return (
    <SafeAreaWrapper backgroundColor={ONBOARDING.bg}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ReceiptRival brandColor={ONBOARDING.purple} />
        </View>

        <View style={styles.imageSection}>
          <Image
            source={images.onboardingAssign}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>Know who</Text>
            <Text style={[styles.titleMain, styles.titleAccent]}>owes what.</Text>
          </View>

          <Text style={styles.subtitle}>
            Visually assign items to friends in seconds.
          </Text>

          <Button
            size="lg"
            className="w-full rounded-xl"
            onPress={() => router.push("/OnboardingScan")}
          >
            <Button.Label className="text-xl font-semibold">Next</Button.Label>
            <Ionicons name="arrow-forward" size={24} color={ONBOARDING.text} />
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
    backgroundColor: ONBOARDING.bg,
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
  titleBlock: {
    gap: 4,
  },
  titleMain: {
    fontSize: 48,
    lineHeight: 52,
    textAlign: "center",
    color: ONBOARDING.text,
    fontWeight: "700",
  },
  titleAccent: {
    color: ONBOARDING.purple,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    paddingHorizontal: 4,
    color: ONBOARDING.textMuted,
  },
});
