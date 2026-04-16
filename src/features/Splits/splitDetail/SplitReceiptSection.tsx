import { Platform, Text, useColorScheme, View } from "react-native";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { ReceiptDottedRow } from "./ReceiptDottedRow";
import {
  computeReceiptMeta,
  formatMoney,
  formatReceiptDate,
} from "./formatting";
import { Button } from "heroui-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Money01Icon } from "@hugeicons/core-free-icons";

const mono = {
  fontFamily: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

type Props = {
  split: Doc<"splits">;
};

export function SplitReceiptSection({ split }: Props) {
  const receiptMeta = computeReceiptMeta(split);
  const dateLine = formatReceiptDate(split.date, split.createdAt);
  const timeSuffix = split.time?.trim() ? ` · ${split.time}` : "";

  const colorScheme = useColorScheme();
  return (
    <View className="mb-1 overflow-hidden rounded-2xl border border-border bg-background-secondary px-4 py-5 shadow-sm">
      <Text
        className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400"
        style={mono}
        numberOfLines={1}
      >
        {(split.location || "Split").toUpperCase()}
      </Text>
      <Text className="text-2xl font-extrabold text-foreground">
        {split.title}
      </Text>
      <Text className="mt-1 text-xs text-foreground" style={mono}>
        {dateLine}
        {timeSuffix}
      </Text>

      <View className="my-5 h-px bg-border/80" />

      {split.items.map((it, idx) => (
        <ReceiptDottedRow
          key={`${it.name}-${idx}`}
          left={`${it.name} (×${it.quantity})`}
          right={formatMoney(it.price * it.quantity)}
        />
      ))}

      <View className="my-4 border-t border-dashed border-border/80" />

      <ReceiptDottedRow
        left="Subtotal"
        right={formatMoney(receiptMeta.subtotal)}
      />
      <ReceiptDottedRow
        left={
          receiptMeta.taxPct != null
            ? `Tax (${receiptMeta.taxPct.toFixed(1)}%)`
            : "Tax"
        }
        right={formatMoney(split.tax ?? 0)}
      />
      <ReceiptDottedRow
        left={
          receiptMeta.tipPct != null
            ? `Tip (${receiptMeta.tipPct.toFixed(0)}%)`
            : "Tip"
        }
        right={formatMoney(split.tip ?? 0)}
      />

      <View className="my-4 border-t border-dashed border-border/80" />

      <View className="flex-row items-center justify-between">
        <Text
          className="text-lg font-extrabold uppercase tracking-widest text-lime-400"
          style={mono}
        >
          Total due
        </Text>
        <Text
          className="text-2xl font-extrabold tabular-nums text-lime-400"
          style={mono}
        >
          {formatMoney(split.total)}
        </Text>
      </View>

      <Text
        className="mt-5 text-center text-[11px] italic leading-relaxed text-foreground/70"
        style={mono}
      >
        &quot;You feasted like kings, now pay like rivals. No refunds for
        pride.&quot;
      </Text>

      <Button className="mt-3 items-center justify-center" variant="primary">
        <HugeiconsIcon
          icon={Money01Icon}
          color={colorScheme === "dark" ? "#ffffff" : "#000000"}
        />
        <Button.Label>Pay your share</Button.Label>
      </Button>
    </View>
  );
}
