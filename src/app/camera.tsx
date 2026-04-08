import { CameraView, useCameraPermissions } from "expo-camera";
import { useAction } from "convex/react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "heroui-native";
import { api } from "../../convex/_generated/api";
import OCRScannerLoader from "../components/loaders/OCRScannerLoader";
import CaptureView from "../features/Camera/CaptureView";
import { localImageUriToBase64Parts } from "../features/Camera/cameraImage";
import PreviewView from "../features/Camera/PreviewView";
import Permission from "../features/Camera/Permission";
import PermissionLoading from "../features/Camera/PermissionLoading";
import type { CaptureFabAction } from "../features/Camera/captureFab";
import {
  CameraRotated01Icon,
  ReceiptTextIcon,
} from "@hugeicons/core-free-icons";

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
    return <PermissionLoading />;
  }

  if (!permission.granted) {
    return (
      <Permission
        onBack={() => router.back()}
        onRequestPermission={requestPermission}
      />
    );
  }

  const handlePickImageFromGallery = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!result.granted) {
      toast.show({
        label: "Permission denied",
        description: "Please grant permission to access your photos.",
        variant: "danger",
      });
      return;
    }

    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!imageResult.canceled) {
      setCapturedImage(imageResult.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });
    if (photo) setCapturedImage(photo.uri);
  };

  const analyze = async () => {
    if (!capturedImage || ocrBusy) return;
    try {
      setOcrBusy(true);
      const { imageBase64, mimeType } =
        await localImageUriToBase64Parts(capturedImage);
      const result = await processOcr({ imageBase64, mimeType });
      setCapturedImage(null);
      router.push({
        pathname: "/ReviewItem",
        params: { data: JSON.stringify(result) },
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

  if (ocrBusy) {
    return <OCRScannerLoader />;
  }

  if (capturedImage) {
    return (
      <PreviewView
        imageUri={capturedImage}
        onRetake={() => setCapturedImage(null)}
        onReadReceipt={analyze}
      />
    );
  }

  const captureFabActions = useMemo<CaptureFabAction[]>(
    () => [
      {
        id: "flip-camera",
        icon: CameraRotated01Icon,
        label: "Flip camera",
        onPress: () =>
          setFacing((prev) => (prev === "back" ? "front" : "back")),
      },
      {
        id: "custom",
        icon: ReceiptTextIcon,
        label: "Custom action",
        onPress: () =>
          toast.show({
            label: "Custom action",
            description: "Edit fabActions in camera.tsx to wire this button.",
          }),
      },
    ],
    [toast],
  );

  return (
    <CaptureView
      cameraRef={cameraRef}
      facing={facing}
      flash={flash}
      onBack={() => router.back()}
      onToggleFlash={() => setFlash((prev) => (prev === "off" ? "on" : "off"))}
      onTakePicture={takePicture}
      onPickFromGallery={handlePickImageFromGallery}
      fabActions={captureFabActions}
    />
  );
}
