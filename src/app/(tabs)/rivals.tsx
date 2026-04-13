import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import HeaderRoot from "../../components/composition/Header";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";

import { Tabs } from "heroui-native/tabs";
import { AddRivalDialog } from "../../features/Rivals/AddRivalDialog";
import { api } from "../../../convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Relieved02Icon } from "@hugeicons/core-free-icons";
import { router } from "expo-router";
import type { Id } from "../../../convex/_generated/dataModel";

type RivalRow = {
  _id: Id<"rivals">;
  rivalUserId: string;
  nickname?: string;
  createdAt: number;
  rivalStatus: "pending" | "accepted" | "rejected";
  invitedByUserId?: string;
  incomingRequest: boolean;
  name: string;
  email: string;
  image: string | null;
};

function getInitials(name: string) {
  if (!name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const RivalsScreen = () => {
  const [addRivalOpen, setAddRivalOpen] = useState(false);
  const [tab, setTab] = useState("gang");
  const [busyId, setBusyId] = useState<Id<"rivals"> | null>(null);

  const rivals = useQuery(api.rivals.listMyRivals);
  const acceptRival = useMutation(api.rivals.acceptRival);
  const rejectRival = useMutation(api.rivals.rejectRival);
  const removeRival = useMutation(api.rivals.removeRival);

  const { gang, limbo, limboCount } = useMemo(() => {
    if (!rivals) {
      return { gang: [] as RivalRow[], limbo: [] as RivalRow[], limboCount: 0 };
    }
    const gang = rivals.filter((r) => r.rivalStatus === "accepted");
    const limbo = rivals.filter((r) => r.rivalStatus === "pending");
    return { gang, limbo, limboCount: limbo.length };
  }, [rivals]);

  const run = async (id: Id<"rivals">, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  const renderRivalCard = (r: RivalRow, mode: "gang" | "limbo") => {
    const displayName = r.nickname ?? r.name;
    const subtitle = r.nickname ? `${r.name} · ${r.email}` : r.email;
    const pendingIncoming = mode === "limbo" && r.incomingRequest;
    const pendingOutgoing = mode === "limbo" && !r.incomingRequest;

    return (
      <Card
        key={r._id}
        variant="default"
        className="border border-border bg-surface/80"
      >
        <Card.Header className="flex-row items-start gap-3 pb-0">
          <Pressable
            accessibilityRole="button"
            disabled={r.rivalStatus !== "accepted"}
            onPress={() =>
              router.push({
                pathname: "/RivalDetail",
                params: { id: r.rivalUserId },
              })
            }
            className="flex-row flex-1 items-start gap-3 active:opacity-80"
          >
            <Avatar alt={displayName} size="md" variant="soft" color="accent">
              {r.image ? <Avatar.Image source={{ uri: r.image }} /> : null}
              <Avatar.Fallback className="font-semibold">
                {getInitials(displayName)}
              </Avatar.Fallback>
            </Avatar>
            <View className="min-w-0 flex-1">
              <Card.Title className="text-base" numberOfLines={1}>
                {displayName}
              </Card.Title>
              {subtitle ? (
                <Card.Description numberOfLines={2}>
                  {subtitle}
                </Card.Description>
              ) : null}
            </View>
          </Pressable>
        </Card.Header>

        {mode === "limbo" && pendingIncoming ? (
          <Card.Footer className="flex-row gap-2 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              isDisabled={busyId === r._id}
              onPress={() => run(r._id, () => acceptRival({ rivalId: r._id }))}
            >
              <Button.Label>Accept</Button.Label>
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              isDisabled={busyId === r._id}
              onPress={() => run(r._id, () => rejectRival({ rivalId: r._id }))}
            >
              <Button.Label>Decline</Button.Label>
            </Button>
          </Card.Footer>
        ) : null}

        {mode === "limbo" && pendingOutgoing ? (
          <Card.Footer className="flex-col gap-2 pt-2">
            <Text className="text-sm text-foreground/60">
              Ball&apos;s in their court — no notifications, just vibes.
            </Text>
            <Button
              variant="danger"
              isDisabled={busyId === r._id}
              onPress={() =>
                run(r._id, () => removeRival({ rivalUserId: r.rivalUserId }))
              }
            >
              <Button.Label>Cancel request</Button.Label>
            </Button>
          </Card.Footer>
        ) : null}
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <HeaderRoot>
        <HeaderRoot.Notification />
        <HeaderRoot.Profile />
      </HeaderRoot>

      <ScrollView
        className="flex-1 p-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="text-3xl font-bold text-foreground ">Rivals</Text>
            <Text className="text-base text-foreground/50 font-inter-semibold">
              “Pal today, PayPal tomorrow” watchlist{" "}
            </Text>
          </View>
          <Button variant="outline" onPress={() => setAddRivalOpen(true)}>
            <Button.Label>Add Rival</Button.Label>
          </Button>
        </View>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <Tabs.List className="bg-surface/40 rounded-2xl border border-border p-1">
            <Tabs.Trigger value="gang" className="flex-1 rounded-xl py-2.5">
              <Tabs.Label className="text-center text-sm font-semibold">
                Receipt Gang
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="limbo" className="flex-1 rounded-xl py-2.5">
              <Tabs.Label className="text-center text-sm font-semibold">
                Venmo Limbo{limboCount > 0 ? ` (${limboCount})` : ""}
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Indicator className="rounded-xl bg-accent/25" />
          </Tabs.List>

          <Tabs.Content value="gang" className="mt-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-foreground">
                Certified splitters
              </Text>
              <HugeiconsIcon icon={Relieved02Icon} size={20} color={"white"} />
            </View>
            {rivals === undefined ? (
              <Text className="text-foreground/60">Loading rivals…</Text>
            ) : gang.length === 0 ? (
              <Text className="text-foreground/60">
                Nobody&apos;s in the gang yet. Approve a request in Venmo Limbo
                or add a rival.
              </Text>
            ) : (
              <View className="gap-3">
                {gang.map((r) => renderRivalCard(r, "gang"))}
              </View>
            )}
          </Tabs.Content>

          <Tabs.Content value="limbo" className="mt-4">
            <Text className="text-foreground/70 mb-3 text-sm">
              <Text className="font-semibold text-foreground">Pending</Text> in
              the schema — cosign or ghost &apos;em.
            </Text>
            {rivals === undefined ? (
              <Text className="text-foreground/60">Loading…</Text>
            ) : limbo.length === 0 ? (
              <Text className="text-foreground/60">
                Inbox zero. You love to see it.
              </Text>
            ) : (
              <View className="gap-3">
                {limbo.map((r) => renderRivalCard(r, "limbo"))}
              </View>
            )}
          </Tabs.Content>
        </Tabs>
      </ScrollView>

      <AddRivalDialog open={addRivalOpen} onOpenChange={setAddRivalOpen} />
    </View>
  );
};

export default RivalsScreen;
