import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

const POSITIVE = "#34C759";
const NEGATIVE = "#FF3B30";
const MUTED = "#8E8E93";

const CHART_W = 92;
const CHART_H = 44;
const CHART_PAD = 3;

export type MarketIndexRowProps = {
  title: string;
  subtitle: string;
  /** Main figure, e.g. "$48,120" */
  value: string;
  /** Pill text, e.g. "+1,240" or "-890" */
  changeText: string;
  positive: boolean;
  /** Normalized 0–1 samples; line/area are derived automatically */
  series: number[];
};

function Sparkline({
  series,
  positive,
}: {
  series: number[];
  positive: boolean;
}) {
  const color = positive ? POSITIVE : NEGATIVE;
  const gradientId = positive ? "sparkFillPos" : "sparkFillNeg";

  const { linePath, areaPath, midY } = useMemo(() => {
    const s = series.length >= 2 ? series : [0.4, 0.5, 0.45, 0.6, 0.55];
    const min = Math.min(...s);
    const max = Math.max(...s);
    const range = max - min || 1;
    const innerW = CHART_W - CHART_PAD * 2;
    const innerH = CHART_H - CHART_PAD * 2;
    const pts = s.map((v, i) => {
      const x = CHART_PAD + (i / (s.length - 1)) * innerW;
      const y = CHART_PAD + (1 - (v - min) / range) * innerH;
      return { x, y };
    });
    const linePathD = pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
      )
      .join(" ");
    const midYVal = CHART_H / 2;
    const last = pts[pts.length - 1]!;
    const first = pts[0]!;
    const areaPathD = `${linePathD} L${last.x.toFixed(2)} ${CHART_H} L${first.x.toFixed(2)} ${CHART_H} Z`;
    return { linePath: linePathD, areaPath: areaPathD, midY: midYVal };
  }, [series]);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.38} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Line
        x1={CHART_PAD}
        y1={midY}
        x2={CHART_W - CHART_PAD}
        y2={midY}
        stroke={MUTED}
        strokeWidth={1}
        strokeDasharray="4 5"
        opacity={0.5}
      />
      <Path d={areaPath} fill={`url(#${gradientId})`} />
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MarketIndexRow({
  title,
  subtitle,
  value,
  changeText,
  positive,
  series,
}: MarketIndexRowProps) {
  const pillColor = positive ? POSITIVE : NEGATIVE;

  return (
    <View className="flex-row items-center py-3.5 ">
      <View className="min-w-0 flex-1 pr-2">
        <Text className="text-base font-bold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        <Text
          className="mt-0.5 text-xs leading-snug text-foreground"
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
      <View className="mr-1.5">
        <Sparkline series={series} positive={positive} />
      </View>
      <View className="min-w-[88px] items-end">
        <Text className="text-base font-bold text-foreground">{value}</Text>
        <View
          className="mt-1 rounded-lg px-2 py-0.5"
          style={{ backgroundColor: pillColor }}
        >
          <Text className="text-xs font-semibold text-white">{changeText}</Text>
        </View>
      </View>
    </View>
  );
}
