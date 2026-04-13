import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import {
  Avatar,
  Button,
  Dialog,
  InputGroup,
  Label,
  SearchField,
  TextField,
  useToast,
} from "heroui-native";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/betterAuth/_generated/dataModel";

function getInitials(name: string | null | undefined) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type Step = "list" | "nickname";

export type AddRivalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddRivalDialog({ open, onOpenChange }: AddRivalDialogProps) {
  const { toast } = useToast();
  const users = useQuery(api.rivals.getUsers, open ? {} : "skip");
  const addRival = useMutation(api.rivals.addRival);

  const [step, setStep] = useState<Step>("list");
  const [search, setSearch] = useState("");
  const [nickname, setNickname] = useState("");
  const [selected, setSelected] = useState<Doc<"user"> | null>(null);
  const [saving, setSaving] = useState(false);

  const listMaxHeight = useMemo(
    () => Math.round(Dimensions.get("window").height * 0.52),
    [],
  );

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u: Doc<"user">) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const resetForm = useCallback(() => {
    setStep("list");
    setSearch("");
    setNickname("");
    setSelected(null);
    setSaving(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm();
      onOpenChange(next);
    },
    [onOpenChange, resetForm],
  );

  const onConfirmNickname = useCallback(async () => {
    if (!selected) return;
    const trimmed = nickname.trim();
    setSaving(true);
    try {
      await addRival({
        rivalUserId: selected._id,
        nickname: trimmed.length > 0 ? trimmed : undefined,
      });
      toast.show({
        variant: "success",
        label: "Rival added",
        description: `${selected.name} is on your list.`,
      });
      handleOpenChange(false);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not add this rival.";
      toast.show({
        variant: "danger",
        label: "Something went wrong",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }, [addRival, handleOpenChange, nickname, selected, toast]);

  return (
    <Dialog isOpen={open} onOpenChange={handleOpenChange} className="w-full">
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="mx-4 rounded-2xl bg-surface p-0">
          <View className="flex-row items-start justify-between gap-2 border-b border-border px-4 py-3">
            <View className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {step === "list" ? "Add rival" : "Nickname (optional)"}
              </Dialog.Title>
              {step === "nickname" && selected ? (
                <Dialog.Description className="mt-1 text-sm text-foreground/60">
                  How you want to remember {selected.name}.
                </Dialog.Description>
              ) : null}
            </View>
            <Dialog.Close />
          </View>

          {step === "list" ? (
            <>
              <View className="px-4 pb-2 pt-3">
                <SearchField value={search} onChange={setSearch}>
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search name or email" />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
              </View>

              <ScrollView
                className="px-4 pb-4"
                style={{ maxHeight: listMaxHeight }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {users === undefined ? (
                  <Text className="py-6 text-center text-foreground/60">
                    Loading users…
                  </Text>
                ) : filtered.length === 0 ? (
                  <Text className="py-6 text-center text-foreground/60">
                    {users.length === 0
                      ? "No other accounts yet. Add rival only works after someone else signs up (another device, simulator, or a second email). Sign out and create a test account if you need to try it solo."
                      : "No matches for your search."}
                  </Text>
                ) : (
                  <View className="gap-2">
                    {filtered.map((user: Doc<"user">) => (
                      <View
                        key={user._id}
                        className="flex-row items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2"
                      >
                        <Avatar
                          alt={user.name}
                          size="sm"
                          variant="soft"
                          color="accent"
                        >
                          {user.image ? (
                            <Avatar.Image source={{ uri: user.image }} />
                          ) : null}
                          <Avatar.Fallback className="text-xs font-semibold">
                            {getInitials(user.name)}
                          </Avatar.Fallback>
                        </Avatar>
                        <View className="min-w-0 flex-1">
                          <Text
                            className="text-base font-medium text-foreground"
                            numberOfLines={1}
                          >
                            {user.name}
                          </Text>
                          <Text
                            className="text-sm text-foreground/60"
                            numberOfLines={1}
                          >
                            {user.email}
                          </Text>
                        </View>
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => {
                            setSelected(user);
                            setNickname("");
                            setStep("nickname");
                          }}
                        >
                          <Button.Label>Add</Button.Label>
                        </Button>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </>
          ) : (
            <View className="gap-4 p-4">
              {selected ? (
                <View className="flex-row items-center gap-3">
                  <Avatar
                    alt={selected.name}
                    size="md"
                    variant="soft"
                    color="accent"
                  >
                    {selected.image ? (
                      <Avatar.Image source={{ uri: selected.image }} />
                    ) : null}
                    <Avatar.Fallback className="font-semibold">
                      {getInitials(selected.name)}
                    </Avatar.Fallback>
                  </Avatar>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {selected.name}
                    </Text>
                    <Text
                      className="text-sm text-foreground/60"
                      numberOfLines={1}
                    >
                      {selected.email}
                    </Text>
                  </View>
                </View>
              ) : null}

              <TextField>
                <Label>
                  <Label.Text>Nickname</Label.Text>
                </Label>
                <InputGroup>
                  <InputGroup.Input
                    placeholder="e.g. Pizza night nemesis"
                    value={nickname}
                    onChangeText={setNickname}
                    autoCapitalize="sentences"
                  />
                </InputGroup>
              </TextField>

              <View className="flex-row justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onPress={() => {
                    setStep("list");
                    setSelected(null);
                    setNickname("");
                  }}
                >
                  <Button.Label>Back</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  isDisabled={saving || !selected}
                  onPress={() => void onConfirmNickname()}
                >
                  <Button.Label>
                    {saving ? "Saving…" : "Save rival"}
                  </Button.Label>
                </Button>
              </View>
            </View>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
