import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft02Icon,
  Refresh01Icon,
  ScanEyeIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { CameraIcon } from "./CameraIcon";
import { B, W, W08, W12, W40 } from "./constants";

type Props = {
  imageUri: string;
  onRetake: () => void;
  onReadReceipt: () => void;
};

export default function PreviewView({
  imageUri,
  onRetake,
  onReadReceipt,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <View style={styles.dim} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            onPress={onRetake}
            style={({ pressed }) => [
              styles.iconGhost,
              pressed && { opacity: 0.6 },
            ]}
          >
            <CameraIcon icon={ArrowLeft02Icon} size={22} color={W} />
          </Pressable>
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.main}>
          <View style={styles.border}>
            <Image
              source={{ uri: imageUri }}
              style={styles.thumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.savedPill}>
            <CameraIcon icon={Tick02Icon} size={16} color={B} />
            <Text style={styles.savedPillText}>Saved</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onRetake}
            style={({ pressed }) => [
              styles.btnOutline,
              pressed && { opacity: 0.7 },
            ]}
          >
            <CameraIcon icon={Refresh01Icon} size={20} color={W} />
            <Text style={styles.btnOutlineText}>Retake</Text>
          </Pressable>
          <Pressable
            onPress={onReadReceipt}
            style={({ pressed }) => [
              styles.btnSolid,
              pressed && { opacity: 0.85 },
            ]}
          >
            <CameraIcon icon={ScanEyeIcon} size={20} color={B} />
            <Text style={styles.btnSolidText}>Read receipt</Text>
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
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  headerTitle: {
    color: W,
    fontSize: 17,
    fontWeight: "500",
  },
  headerSpacer: {
    width: 44,
  },
  iconGhost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: W08,
    justifyContent: "center",
    alignItems: "center",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  border: {
    borderWidth: 1,
    borderColor: W12,
    borderRadius: 4,
    overflow: "hidden",
    aspectRatio: 3 / 4,
    maxWidth: "100%",
    alignSelf: "center",
    width: "100%",
    maxHeight: "70%",
  },
  thumb: {
    width: "100%",
    height: "100%",
    backgroundColor: B,
  },
  savedPill: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: W,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  savedPillText: {
    color: B,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
  },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: W40,
  },
  btnOutlineText: {
    color: W,
    fontSize: 16,
    fontWeight: "600",
  },
  btnSolid: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: W,
  },
  btnSolidText: {
    color: B,
    fontSize: 16,
    fontWeight: "600",
  },
});
