import type { RefObject } from "react";
import { CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Album01Icon,
  ArrowLeft02Icon,
  CameraRotated01Icon,
  FlashIcon,
  FlashOffIcon,
} from "@hugeicons/core-free-icons";
import { CameraIcon } from "./CameraIcon";
import { B, W, W08, W12 } from "./constants";

const CORNER = 26;
const STROKE = 2;

type Props = {
  cameraRef: RefObject<CameraView | null>;
  facing: "front" | "back";
  flash: "off" | "on";
  onBack: () => void;
  onToggleFlash: () => void;
  onToggleFacing: () => void;
  onTakePicture: () => void;
  onPickFromGallery: () => void;
};

export default function CaptureView({
  cameraRef,
  facing,
  flash,
  onBack,
  onToggleFlash,
  onToggleFacing,
  onTakePicture,
  onPickFromGallery,
}: Props) {
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        style={styles.fadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        style={styles.fadeBottom}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.cameraUI}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.iconGhost,
              pressed && { opacity: 0.6 },
            ]}
          >
            <CameraIcon icon={ArrowLeft02Icon} size={22} color={W} />
          </Pressable>
          <Text style={styles.topTitle}>Photo</Text>
          <Pressable
            onPress={onToggleFlash}
            style={({ pressed }) => [
              styles.iconGhost,
              flash === "on" && styles.iconGhostOn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <CameraIcon
              icon={flash === "on" ? FlashIcon : FlashOffIcon}
              size={22}
              color={W}
            />
          </Pressable>
        </View>

        <View style={styles.framingArea}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={onPickFromGallery}
            style={({ pressed }) => [
              styles.sideRound,
              pressed && { opacity: 0.65 },
            ]}
          >
            <CameraIcon icon={Album01Icon} size={26} color={W} />
          </Pressable>
          <Pressable
            onPress={onTakePicture}
            style={({ pressed }) => [
              styles.shutterRing,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={styles.shutterDisc} />
          </Pressable>

          <Pressable
            onPress={onToggleFacing}
            style={({ pressed }) => [
              styles.sideRound,
              pressed && { opacity: 0.65 },
            ]}
          >
            <CameraIcon icon={CameraRotated01Icon} size={26} color={W} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B,
  },
  cameraUI: {
    flex: 1,
    justifyContent: "space-between",
  },
  fadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  fadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  topTitle: {
    color: W,
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  iconGhost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: W08,
    justifyContent: "center",
    alignItems: "center",
  },
  iconGhostOn: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  framingArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: W,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: STROKE,
    borderRightWidth: STROKE,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sideRound: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: W08,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: W12,
  },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: W,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
  },
  shutterDisc: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: W,
    borderWidth: 1,
    borderColor: B,
  },
});
