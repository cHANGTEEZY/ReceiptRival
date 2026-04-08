import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Description, Spinner, Surface } from "heroui-native";

const DOC_WIDTH = 180;
const DOC_HEIGHT = 240;

type ScanCardProps = {
  docFill: string;
  docStroke: string;
  lineMuted: string;
  lineActive: string;
};

function ReceiptScanCard({
  docFill,
  docStroke,
  lineMuted,
  lineActive,
}: ScanCardProps) {
  const scanProgress = useSharedValue(0);

  useEffect(() => {
    scanProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }),
      -1,
      true,
    );
  }, [scanProgress]);

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanProgress.value * (DOC_HEIGHT - 20) }],
  }));

  const TextLine = ({ top, lineWidth }: { top: number; lineWidth: number }) => {
    const lineStyle = useAnimatedStyle(() => {
      const laserPos = scanProgress.value * (DOC_HEIGHT - 20);
      const distance = Math.abs(laserPos - top);
      const backgroundColor = interpolateColor(distance, [0, 30], [
        lineActive,
        lineMuted,
      ]);
      return { backgroundColor };
    });

    return (
      <Animated.View
        style={[styles.textLine, { top, width: lineWidth }, lineStyle]}
      />
    );
  };

  return (
    <View
      className="overflow-hidden rounded-2xl shadow-lg"
      style={styles.cardShadow}
    >
      <View style={[styles.card, { backgroundColor: docFill }]}>
        <Svg height={DOC_HEIGHT} width={DOC_WIDTH}>
          <Rect
            x="2"
            y="2"
            width={DOC_WIDTH - 4}
            height={DOC_HEIGHT - 4}
            rx="12"
            fill={docFill}
            stroke={docStroke}
            strokeWidth="2"
          />
        </Svg>

        <View style={styles.contentOverlay}>
          <TextLine top={40} lineWidth={100} />
          <TextLine top={65} lineWidth={140} />
          <TextLine top={90} lineWidth={120} />
          <TextLine top={125} lineWidth={130} />
          <TextLine top={150} lineWidth={90} />
          <TextLine top={175} lineWidth={110} />
        </View>

        <Animated.View style={[styles.laserContainer, laserStyle]}>
          <View
            style={[
              styles.laserLine,
              {
                backgroundColor: lineActive,
                shadowColor: lineActive,
              },
            ]}
          />
          <Svg height="40" width={DOC_WIDTH}>
            <Defs>
              <LinearGradient id="ocrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={lineActive} stopOpacity="0" />
                <Stop
                  offset="100%"
                  stopColor={lineActive}
                  stopOpacity="0.45"
                />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={DOC_WIDTH}
              height="40"
              fill="url(#ocrGrad)"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

export default function OCRScannerLoader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const receiptColors = useMemo(
    () =>
      isDark
        ? {
            docFill: "#262626",
            docStroke: "#525252",
            lineMuted: "#525252",
            lineActive: "#38bdf8",
          }
        : {
            docFill: "#ffffff",
            docStroke: "#cbd5e1",
            lineMuted: "#e2e8f0",
            lineActive: "#3b82f6",
          },
    [isDark],
  );

  return (
    <Surface variant="transparent" className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm items-center gap-8">
          <View className="w-full items-center gap-4">
            <Spinner size="lg" />
            <View className="items-center gap-2 px-1">
              <Text className="text-center text-xl font-semibold leading-7 text-foreground">
                Reading your receipt
              </Text>
              <Description className="text-center text-base leading-6 text-muted-foreground">
                Parsing text from the image. Wait a moment…
              </Description>
            </View>
          </View>

          <ReceiptScanCard
            docFill={receiptColors.docFill}
            docStroke={receiptColors.docStroke}
            lineMuted={receiptColors.lineMuted}
            lineActive={receiptColors.lineActive}
          />
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    width: DOC_WIDTH,
    height: DOC_HEIGHT,
  },
  card: {
    width: DOC_WIDTH,
    height: DOC_HEIGHT,
    borderRadius: 16,
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  textLine: {
    height: 8,
    borderRadius: 4,
    position: "absolute",
    left: 20,
  },
  laserContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    width: DOC_WIDTH,
    zIndex: 20,
  },
  laserLine: {
    height: 3,
    width: "100%",
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 5,
  },
});
