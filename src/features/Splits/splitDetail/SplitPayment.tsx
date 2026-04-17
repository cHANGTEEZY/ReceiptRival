import React, { useState } from "react";
import { Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Money01Icon } from "@hugeicons/core-free-icons";

type PaymentMethod = {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
};

const NEPAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "esewa",
    name: "eSewa",
    subtitle: "Popular mobile wallet in Nepal",
    badge: "EW",
  },
  {
    id: "khalti",
    name: "Khalti",
    subtitle: "Wallet and QR payment",
    badge: "KT",
  },
  {
    id: "fonepay",
    name: "Fonepay QR",
    subtitle: "Scan and pay with bank apps",
    badge: "FP",
  },
  
];

type SplitPaymentProps = {
  amountLabel?: string;
};

const SplitPayment = ({ amountLabel }: SplitPaymentProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <>
      <Button
        className="mt-3 items-center justify-center"
        variant="primary"
        onPress={() => setDrawerOpen(true)}
      >
        <HugeiconsIcon
          icon={Money01Icon}
          color={colorScheme === "dark" ? "#ffffff" : "#000000"}
        />
        <Button.Label>Pay your share</Button.Label>
      </Button>

      <BottomSheet isOpen={drawerOpen} onOpenChange={setDrawerOpen} >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["72%", "85%", "97%"]}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
            backgroundClassName="rounded-t-3xl"
            handleIndicatorClassName="bg-foreground/20"
          >
            <BottomSheet.Title className="px-4 pb-1 pt-2 text-lg font-semibold text-foreground">
              Choose payment method
            </BottomSheet.Title>
            <BottomSheet.Description className="px-4 pb-3 text-sm text-foreground/60">
              Use your preferred way to settle this split in Nepal.
              {amountLabel ? ` Amount: ${amountLabel}` : ""}
            </BottomSheet.Description>

            <ScrollView className="max-h-115 px-4" showsVerticalScrollIndicator={false}>
              <View className="gap-2 pb-2">
                {NEPAL_PAYMENT_METHODS.map((method) => (
                  <Pressable
                    key={method.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Pay with ${method.name}`}
                    className="flex-row items-center gap-3 rounded-2xl border border-border bg-background-secondary px-3 py-3 active:opacity-80"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                      <Text className="text-xs font-bold text-foreground">
                        {method.badge}
                      </Text>
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {method.name}
                      </Text>
                      <Text className="text-xs text-foreground/55">
                        {method.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View className="border-t border-border px-4 pb-6 pt-3">
              <Button variant="primary" onPress={() => setDrawerOpen(false)}>
                <Button.Label>Close</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </>
  );
};

export default SplitPayment;
