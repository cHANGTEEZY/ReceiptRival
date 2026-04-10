import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useQuery } from "convex/react";
import HeaderRoot from "../../components/composition/Header";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { AddRivalDialog } from "../../features/Rivals/AddRivalDialog";
import { api } from "../../../convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Relieved02Icon } from "@hugeicons/core-free-icons";
import { router } from "expo-router";

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
  const rivals = useQuery(api.rivals.listMyRivals);

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

        <View className="mt-8 flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-foreground">
            Your Pals
          </Text>
          <View className="">
            <HugeiconsIcon icon={Relieved02Icon} size={20} color={"white"} />
          </View>
        </View>

        {rivals === undefined ? (
          <Text className="text-foreground/60 mt-4">Loading rivals…</Text>
        ) : rivals.length === 0 ? (
          <Text className="text-foreground/60 mt-4">
            No rivals yet. Add someone you split bills with—they’ll show up
            here.
          </Text>
        ) : (
          <View className="mt-3 gap-2">
            {rivals.map((r) => {
              const displayName = r.nickname ?? r.name;
              const subtitle = r.nickname ? `${r.name} · ${r.email}` : r.email;
              return (
                <Pressable
                  key={r._id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/RivalDetail",
                      params: { id: r.rivalUserId },
                    })
                  }
                  className="flex-row items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-3 active:opacity-80"
                >
                  <Avatar
                    alt={displayName}
                    size="md"
                    variant="soft"
                    color="accent"
                  >
                    {r.image ? (
                      <Avatar.Image source={{ uri: r.image }} />
                    ) : null}
                    <Avatar.Fallback className="font-semibold">
                      {getInitials(displayName)}
                    </Avatar.Fallback>
                  </Avatar>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    {subtitle ? (
                      <Text
                        className="text-sm text-foreground/60"
                        numberOfLines={2}
                      >
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddRivalDialog open={addRivalOpen} onOpenChange={setAddRivalOpen} />
    </View>
  );
};

export default RivalsScreen;
