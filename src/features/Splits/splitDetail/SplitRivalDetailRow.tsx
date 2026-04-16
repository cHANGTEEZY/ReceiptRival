import { Text } from "react-native";
import ListRowCard from "../../../components/ListRowCard";
import { formatMoney, getInitials } from "./formatting";

export type SplitRivalDetailRowProps = {
  variant: "creator" | "rival";
  displayName: string;
  amount: number;
  settled: boolean;
  image: string | null;
};

export function SplitRivalDetailRow({
  variant,
  displayName,
  amount,
  settled,
  image,
}: SplitRivalDetailRowProps) {
  const subtitle =
    variant === "creator"
      ? settled
        ? "Settled up"
        : "Your share"
      : settled
        ? "Paid up"
        : "Still owes";
  const statusLabel =
    variant === "creator"
      ? settled
        ? "SETTLED"
        : "PENDING"
      : settled
        ? "SETTLED UP"
        : "RUNNING LATE";

  return (
    <ListRowCard
      rowVariant="leaderboard"
      variant="secondary"
      className="border-border bg-background px-0 py-0"
      bodyClassName="px-3 py-3"
    >
      <ListRowCard.Icon
        alt={displayName}
        source={image ? { uri: image } : undefined}
        className="rounded-2xl"
      >
        {getInitials(displayName)}
      </ListRowCard.Icon>
      <ListRowCard.Content>
        <ListRowCard.Title numberOfLines={1}>{displayName}</ListRowCard.Title>
        <ListRowCard.Subtitle numberOfLines={1} className="text-foreground/70">
          {subtitle}
        </ListRowCard.Subtitle>
      </ListRowCard.Content>
      <ListRowCard.Trailing>
        <ListRowCard.Item>
          <Text className="text-foreground">{formatMoney(amount)}</Text>
        </ListRowCard.Item>
        <ListRowCard.Item className="pt-1">
          <Text
            className={`text-base font-semibold uppercase tracking-wide ${
              settled ? "text-lime-400" : "text-violet-400"
            }`}
          >
            {statusLabel}
          </Text>
        </ListRowCard.Item>
      </ListRowCard.Trailing>
    </ListRowCard>
  );
}
