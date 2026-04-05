import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import { images } from "../../assets/images";

const OnboardingAssign = () => {
  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        <Image source={images.onboardingAssign} style={styles.image} />
      </View>
    </SafeAreaWrapper>
  );
};

export default OnboardingAssign;

const styles = StyleSheet.create({
  image: {
    width: 28,
    height: 28,
  },
});
