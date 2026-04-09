import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { RivalSchema } from "../../features/Rivals/data/schema";
import { rivalSchema } from "../../features/Rivals/data/schema";
import { InputGroup, Label, TextField } from "heroui-native";
import { authClient } from "../../lib/auth-client";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import type { Doc } from "../../../convex/betterAuth/_generated/dataModel";

const RivalForm = () => {
  const { data } = authClient.useSession();

  const rivals = useQuery(api.rivals.getUsers);

  console.log("rivals", rivals);

  const form = useForm<RivalSchema>({
    resolver: zodResolver(rivalSchema),
    defaultValues: {
      nickname: "",
      userId: data?.user?.id,
      rivalUserId: "",
    },
  });
  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <Controller
          name="nickname"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField isInvalid={Boolean(fieldState.error)}>
              <Label>
                <Label.Text>Nickname</Label.Text>
              </Label>
              <InputGroup>
                <InputGroup.Input
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </InputGroup>
            </TextField>
          )}
        />

        <View className="mt-4 px-1">
          <Text className="text-foreground mb-2 font-semibold">Users you can add</Text>
          {rivals === undefined ? (
            <Text className="text-muted-foreground">Loading…</Text>
          ) : rivals.length === 0 ? (
            <Text className="text-muted-foreground">
              No other accounts yet (only users in the app database show here).
            </Text>
          ) : (
            rivals.map((user: Doc<"user">) => (
              <Text key={user._id} className="text-foreground py-1">
                {user.name} · {user.email}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default RivalForm;

const styles = StyleSheet.create({});
