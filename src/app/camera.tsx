import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  Album01Icon,
  ArrowLeft02Icon,
  Camera01Icon,
  CameraRotated01Icon,
  FlashIcon,
  FlashOffIcon,
  Refresh01Icon,
  ScanEyeIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "heroui-native";

const W = "#ffffff";
const B = "#000000";
const W40 = "rgba(255,255,255,0.4)";
const W12 = "rgba(255,255,255,0.12)";
const W08 = "rgba(255,255,255,0.08)";

// Raw base64 + mime are sent to Convex; `processOcr` forwards the file as multipart field `image`.

function mimeFromImageUri(uri: string): string {
  const path = uri.split("?")[0].split("#")[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".heic") || path.endsWith(".heif")) return "image/heic";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

async function localImageUriToBase64Parts(uri: string): Promise<{
  imageBase64: string;
  mimeType: string;
}> {
  const imageBase64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return { imageBase64, mimeType: mimeFromImageUri(uri) };
}

const ICON_STROKE = 1.5;

function Icon({
  icon,
  size,
  color,
}: {
  icon: IconSvgElement;
  size: number;
  color: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={ICON_STROKE}
    />
  );
}

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const cameraRef = useRef<CameraView>(null);
  const processOcr = useAction(api.ocr.processOcr);
  const [ocrBusy, setOcrBusy] = useState(false);

  const { toast } = useToast();

  if (!permission) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={W} />
        <Text style={styles.muted}>Loading</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionRoot}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.6 }]}
        >
          <Icon icon={ArrowLeft02Icon} size={22} color={W} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <View style={styles.permissionBody}>
          <View style={styles.permissionIconCircle}>
            <Icon icon={Camera01Icon} size={40} color={W} />
          </View>
          <Text style={styles.permissionTitle}>Camera</Text>
          <Text style={styles.permissionCopy}>
            Needed to capture receipts. You can turn this off anytime in
            Settings.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.ctaWhite,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.ctaWhiteText}>Allow access</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handlePickImageFromGaller = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!result.granted) {
      toast.show({
        label: "Permission denied",
        description: "Please grant permission to access your photos.",
        variant: "danger",
      });
      return;
    }

    let imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!imageResult.canceled) {
      setCapturedImage(imageResult.assets[0].uri as string);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });
    if (photo) setCapturedImage(photo.uri as string);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const retake = () => setCapturedImage(null);

  const analyze = async () => {
    if (!capturedImage || ocrBusy) return;
    try {
      setOcrBusy(true);
      const { imageBase64, mimeType } =
        await localImageUriToBase64Parts(capturedImage);
      const result = await processOcr({ imageBase64, mimeType });
      console.log("OCR result:", result);
      toast.show({
        label: "Receipt read",
        description: "Check the console for raw OCR output for now.",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not read receipt.";
      toast.show({
        label: "OCR failed",
        description: message,
        variant: "danger",
      });
    } finally {
      setOcrBusy(false);
    }
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: capturedImage }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.previewDim} />

        <SafeAreaView style={styles.previewSafe}>
          <View style={styles.previewHeader}>
            <Pressable
              onPress={retake}
              style={({ pressed }) => [
                styles.iconGhost,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Icon icon={ArrowLeft02Icon} size={22} color={W} />
            </Pressable>
            <Text style={styles.previewHeaderTitle}>Preview</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.previewMain}>
            <View style={styles.previewBorder}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.savedPill}>
              <Icon icon={Tick02Icon} size={16} color={B} />
              <Text style={styles.savedPillText}>Saved</Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <Pressable
              onPress={retake}
              style={({ pressed }) => [
                styles.btnOutline,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Icon icon={Refresh01Icon} size={20} color={W} />
              <Text style={styles.btnOutlineText}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={analyze}
              disabled={ocrBusy}
              style={({ pressed }) => [
                styles.btnSolid,
                (pressed || ocrBusy) && { opacity: 0.85 },
                ocrBusy && { opacity: 0.6 },
              ]}
            >
              <Icon icon={ScanEyeIcon} size={20} color={B} />
              <Text style={styles.btnSolidText}>
                {ocrBusy ? "Reading…" : "Read receipt"}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconGhost,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Icon icon={ArrowLeft02Icon} size={22} color={W} />
          </Pressable>
          <Text style={styles.topTitle}>Photo</Text>
          <Pressable
            onPress={toggleFlash}
            style={({ pressed }) => [
              styles.iconGhost,
              flash === "on" && styles.iconGhostOn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Icon
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
            onPress={handlePickImageFromGaller}
            style={({ pressed }) => [
              styles.sideRound,
              pressed && { opacity: 0.65 },
            ]}
          >
            <Icon icon={Album01Icon} size={26} color={W} />
          </Pressable>
          <Pressable
            onPress={takePicture}
            style={({ pressed }) => [
              styles.shutterRing,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={styles.shutterDisc} />
          </Pressable>

          <Pressable
            onPress={toggleFacing}
            style={({ pressed }) => [
              styles.sideRound,
              pressed && { opacity: 0.65 },
            ]}
          >
            <Icon icon={CameraRotated01Icon} size={26} color={W} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CORNER = 26;
const STROKE = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: B,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  muted: {
    color: W40,
    fontSize: 14,
    fontWeight: "500",
  },

  permissionRoot: {
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
  permissionBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 48,
  },
  permissionIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: W12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  permissionTitle: {
    color: W,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  permissionCopy: {
    color: W40,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 32,
  },
  ctaWhite: {
    backgroundColor: W,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 200,
    alignItems: "center",
  },
  ctaWhiteText: {
    color: B,
    fontSize: 16,
    fontWeight: "600",
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
  headerSpacer: {
    width: 44,
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

  previewDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
  },
  previewSafe: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  previewHeaderTitle: {
    color: W,
    fontSize: 17,
    fontWeight: "500",
  },
  previewMain: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  previewBorder: {
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
  previewImage: {
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
  previewActions: {
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
