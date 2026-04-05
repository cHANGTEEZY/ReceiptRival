import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { images } from "../../assets/images";
import { Button } from "heroui-native";

const OnboardingAssign = () => {
  return (
    <SafeAreaWrapper>
      <View style={styles.screen}>
        <View style={styles.imageSection}>
          <Image
            source={images.onboardingAssign}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottom}>
          <View className="gap-1">
            <Text className="text-foreground text-5xl text-center">
              Know who{" "}
            </Text>
            <Text className="italic text-5xl text-center text-purple-300">
              owes what.
            </Text>
          </View>

          <Text className="text-accent-foreground text-2xl text-center px-1">
            Visually assign items to friends in seconds.
          </Text>

          <Button size="lg" className="mt-2 w-full self-stretch rounded-xl">
            <Button.Label className="text-xl font-semibold">Next</Button.Label>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </Button>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default OnboardingAssign;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bottom: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 20,
    gap: 20,
    zIndex: 40,
  },
});
