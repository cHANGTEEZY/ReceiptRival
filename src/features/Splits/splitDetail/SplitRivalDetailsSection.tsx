import { Platform, Text, View } from "react-native";
import type { Id } from "../../../../convex/_generated/dataModel";
import { SplitRivalDetailRow } from "./SplitRivalDetailRow";

const mono = {
  fontFamily: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

export type CreatorRow = {
  displayName: string;
  amount: number;
  settled: boolean;
  image: string | null;
};

export type RivalParticipantRow = {
  participantId: Id<"splitParticipants">;
  amount: number;
  paid: boolean;
  displayName: string;
  image: string | null;
};

type Props = {
  settledCount: number;
  totalPeople: number;
  creatorRow: CreatorRow | null;
  rivals: RivalParticipantRow[];
};

export function SplitRivalDetailsSection({
  settledCount,
  totalPeople,
  creatorRow,
  rivals,
}: Props) {
  const pending = totalPeople - settledCount;

  return (
    <View className="gap-3 pt-6">
      <View className="flex-row items-center justify-between px-0.5">
        <Text className="text-sm font-semibold uppercase tracking-widest text-foreground">
          The rivals
        </Text>
        <Text
          className="text-[10px] font-semibold uppercase tracking-wider text-lime-400"
          style={mono}
        >
          {settledCount} settled / {pending} pending
        </Text>
      </View>

      {creatorRow ? (
        <SplitRivalDetailRow
          variant="creator"
          displayName={creatorRow.displayName}
          amount={creatorRow.amount}
          settled={creatorRow.settled}
          image={creatorRow.image}
        />
      ) : null}

      {rivals.map((r) => (
        <SplitRivalDetailRow
          key={r.participantId}
          variant="rival"
          displayName={r.displayName}
          amount={r.amount}
          settled={r.paid}
          image={r.image}
        />
      ))}
    </View>
  );
}
