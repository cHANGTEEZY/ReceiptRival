import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import ReceiptRival from "../../components/ReceiptRival";
import { images } from "../../assets/images";
import { Button } from "heroui-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ONBOARDING } from "./onboarding-theme";

const H_PADDING = 24;

/** Taller hero so `cover` has room; tweak 0.42–0.52 as needed. */
const IMAGE_HEIGHT_RATIO = 0.5;
const IMAGE_CORNER_RADIUS = 20;

const OnboardingScan = () => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const imageHeight = windowHeight * IMAGE_HEIGHT_RATIO;

  return (
    <SafeAreaWrapper backgroundColor={ONBOARDING.bg}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ReceiptRival brandColor={ONBOARDING.purple} />
        </View>

        <View
          style={[
            styles.imageSection,
            {
              width: windowWidth,
              marginHorizontal: -H_PADDING,
            },
          ]}
        >
          <View
            style={[
              styles.imageClip,
              {
                height: imageHeight,
                borderRadius: IMAGE_CORNER_RADIUS,
              },
            ]}
          >
            <Image
              source={images.onboardingScan}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.titleBlock}>
            <Text style={styles.titleLine}>Stop doing</Text>
            <Text style={[styles.titleLine, styles.titleAccent]}>
              receipt math.
            </Text>
          </View>
          <Text style={styles.subtitle}>Scan. Assign. Settle.</Text>
          <Button
            size="lg"
            className="w-full rounded-xl"
            onPress={() => router.push("/OnboardingSettle")}
          >
            <Button.Label className="text-xl font-semibold">Next</Button.Label>
            <Ionicons name="arrow-forward" size={24} color={ONBOARDING.text} />
          </Button>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default OnboardingScan;

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
    justifyContent: "center",
    alignItems: "stretch",
  },
  imageClip: {
    width: "100%",
    overflow: "hidden",
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
  titleLine: {
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
