import { Alert, Text, useColorScheme, View } from "react-native";
import React, { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "heroui-native";
import { api } from "../../../convex/_generated/api";
import DetailsHeader from "../../components/composition/Header/DetailsHeader";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import ListRowCard from "../../components/ListRowCard";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { RIVAL_ACTIONS } from "../../features/Rivals/data";

const RivalDetail = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const removeRival = useMutation(api.rivals.removeRival);
  const scheme = useColorScheme();
  const iconMuted = scheme === "dark" ? "#a3a3a3" : "#737373";
  const chevronColor = scheme === "dark" ? "#fafafa" : "#171717";
  const iconColorFor = (pair: readonly [string, string]) =>
    scheme === "dark" ? pair[1] : pair[0];

  const rival = useQuery(api.rivals.getRival, {
    rivalUserId: id as unknown as string,
  });

  const title = rival === undefined ? "Rival" : (rival?.nickname ?? "Rival");
  const rivalUserId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const confirmRemoveRival = useCallback(async () => {
    if (!rivalUserId) return;
    try {
      await removeRival({ rivalUserId });
      toast.show({
        variant: "success",
        label: "Rival removed",

        description: "They'll never know what hit them.",
      });
      router.back();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not remove this rival.";
      toast.show({
        variant: "danger",
        label: "Something went wrong",
        description: message,
      });
    }
  }, [removeRival, rivalUserId, router, title, toast]);

  const handleAction = useCallback(
    (actionId: string) => {
      setIsOpen(false);
      switch (actionId) {
        case "roast-via-notification":
          console.log("Roast via Notification");
          break;
        case "export-debt-history":
          console.log("Export Debt History");
          break;
        case "remove-rival":
          Alert.alert(
            "Block rival?",
            `${title} will be removed from your list. You can add them again later.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Block",
                style: "destructive",
                onPress: () => {
                  void confirmRemoveRival();
                },
              },
            ],
          );
          break;
        default:
          break;
      }
    },
    [confirmRemoveRival, title],
  );

  return (
    <View className="flex-1 bg-background">
      <DetailsHeader
        title={title}
        onBack={() => router.back()}
        rightAction={
          <Button variant="ghost" onPress={() => setIsOpen((prev) => !prev)}>
            <Button.Label>
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={iconMuted}
              />
            </Button.Label>
          </Button>
        }
      />

      <View className="flex-1 p-4">
        {rival === undefined ? (
          <Text className="text-foreground/60">Loading…</Text>
        ) : rival === null ? (
          <Text className="text-foreground/60">
            Couldn’t load this rival.{" "}
            <Text
              className="text-accent font-semibold"
              onPress={() => router.back()}
            >
              Go back
            </Text>
          </Text>
        ) : (
          <Text className="text-foreground/80 text-sm">
            Pal details and activity can go here.
          </Text>
        )}
      </View>

      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} className="w-full">
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className="mx-4 rounded-2xl bg-surface p-0">
            <View className="flex-row items-start justify-between gap-2 border-b border-border px-4 py-3">
              <View className="min-w-0 flex-1 pr-2">
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  Rival actions
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-5 text-foreground/60">
                  Time to settle the score or burn bridges.
                </Dialog.Description>
              </View>
              <Dialog.Close />
            </View>

            <View className="mt-2 overflow-hidden rounded-xl border border-border">
              {RIVAL_ACTIONS.map((action) => (
                <ListRowCard
                  key={action.id}
                  rowVariant="receipt"
                  className={action.cardClassName}
                  bodyClassName="gap-4 px-3 py-2"
                  onPress={() => handleAction(action.id)}
                  feedbackVariant="scale-highlight"
                >
                  <ListRowCard.Icon className="h-9 w-9" size="sm">
                    <HugeiconsIcon
                      icon={action.icon}
                      size={20}
                      color={iconColorFor(action.iconColor)}
                    />
                  </ListRowCard.Icon>
                  <ListRowCard.Content className="p-0">
                    <ListRowCard.Title className={action.titleClassName}>
                      {action.title}
                    </ListRowCard.Title>
                    <ListRowCard.Subtitle className={action.subtitleClassName}>
                      {action.description}
                    </ListRowCard.Subtitle>
                  </ListRowCard.Content>
                  <ListRowCard.Trailing>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={20}
                      color={chevronColor}
                    />
                  </ListRowCard.Trailing>
                </ListRowCard>
              ))}
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
};

export default RivalDetail;
