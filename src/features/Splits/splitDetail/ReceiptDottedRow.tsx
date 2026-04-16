import { Platform, Text, View } from "react-native";

const mono = {
  fontFamily: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

export function ReceiptDottedRow({
  left,
  right,
}: {
  left: string;
  right: string;
}) {
  return (
    <View className="mb-2 flex-row items-end">
      <Text
        className="max-w-[55%] text-sm text-foreground"
        style={mono}
        numberOfLines={2}
      >
        {left}
      </Text>
      <View
        className="mx-2 min-h-[14px] flex-1 border-b border-border"
        style={{
          borderBottomWidth: 1,
          borderStyle: Platform.OS === "ios" ? "dotted" : "dashed",
          marginBottom: 4,
        }}
      />
      <Text className="text-sm tabular-nums text-foreground" style={mono}>
        {right}
      </Text>
    </View>
  );
}
