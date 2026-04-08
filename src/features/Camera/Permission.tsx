import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft02Icon, Camera01Icon } from "@hugeicons/core-free-icons";
import { CameraIcon } from "./CameraIcon";
import { B, W, W12, W40 } from "./constants";

type Props = {
  onBack: () => void;
  onRequestPermission: () => void;
};

export default function Permission({ onBack, onRequestPermission }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.6 }]}
      >
        <CameraIcon icon={ArrowLeft02Icon} size={22} color={W} />
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <CameraIcon icon={Camera01Icon} size={40} color={W} />
        </View>
        <Text style={styles.title}>Camera</Text>
        <Text style={styles.copy}>
          Needed to capture receipts. You can turn this off anytime in
          Settings.
        </Text>
        <Pressable
          onPress={onRequestPermission}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>Allow access</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: B,
    paddingHorizontal: 28,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  backLabel: {
    color: W,
    fontSize: 16,
    fontWeight: "500",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 48,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: W12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    color: W,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  copy: {
    color: W40,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 32,
  },
  cta: {
    backgroundColor: W,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 200,
    alignItems: "center",
  },
  ctaText: {
    color: B,
    fontSize: 16,
    fontWeight: "600",
  },
});
