import React, { useEffect, useRef, useState } from "react";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { TextField } from "heroui-native/text-field";
import { Label } from "heroui-native/label";
import { InputGroup } from "heroui-native/input-group";
import { Select } from "heroui-native/select";
import { Spinner } from "heroui-native/spinner";
import { useToast } from "heroui-native/toast";
import { FieldError } from "heroui-native/field-error";
import { Card } from "heroui-native/card";
import { Popover } from "heroui-native/popover";
import { Avatar } from "heroui-native/avatar";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add01Icon,
  ArrowDown01Icon,
  Calendar03Icon,
  Cancel01Icon,
  Loading01Icon,
  Loading02Icon,
  SaveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  type SplitsFormSchema,
  SPLIT_CATEGORIES,
  splitsFormSchema,
} from "./schema";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function formatDateYmd(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmdToLocalDate(s: string | undefined): Date {
  if (!s?.trim()) return new Date();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return new Date();
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d);
}

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

function formatDateDisplay(ymd: string | undefined) {
  if (!ymd?.trim()) return "Select date";
  const d = parseYmdToLocalDate(ymd);
  if (Number.isNaN(d.getTime())) return "Select date";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function splitAmountsEvenly(
  total: number,
  includeMe: boolean,
  rivalIds: string[],
): { creatorAmount: number; rivalAmounts: Record<string, number> } {
  const n = (includeMe ? 1 : 0) + rivalIds.length;
  if (n === 0) {
    return { creatorAmount: 0, rivalAmounts: {} };
  }
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / n);
  const remainder = cents - base * n;
  const parts: number[] = Array.from({ length: n }, (_, i) =>
    i === n - 1 ? base + remainder : base,
  );
  let i = 0;
  const creatorAmount = includeMe ? parts[i++]! / 100 : 0;
  const rivalAmounts: Record<string, number> = {};
  for (const rid of rivalIds) {
    rivalAmounts[rid] = parts[i++]! / 100;
  }
  return { creatorAmount, rivalAmounts };
}

function clampMeAmount(
  n: number,
  total: number,
  rivalIds: string[],
  rivalAmounts: Record<string, number> | undefined,
): number {
  const safe = Number.isFinite(n) ? Math.max(0, n) : 0;
  const rivalSum = rivalIds.reduce(
    (acc, id) => acc + (rivalAmounts?.[id] ?? 0),
    0,
  );
  const max = Math.max(0, total - rivalSum);
  return Math.min(safe, max);
}

function clampRivalAmount(
  n: number,
  total: number,
  includeMe: boolean,
  creatorAmount: number,
  rivalIds: string[],
  rivalAmounts: Record<string, number> | undefined,
  editingRivalId: string,
): number {
  const safe = Number.isFinite(n) ? Math.max(0, n) : 0;
  const myPart = includeMe ? creatorAmount : 0;
  const others =
    myPart +
    rivalIds
      .filter((id) => id !== editingRivalId)
      .reduce((acc, id) => acc + (rivalAmounts?.[id] ?? 0), 0);
  const max = Math.max(0, total - others);
  return Math.min(safe, max);
}

const defaultItem = (): SplitsFormSchema["items"][number] => ({
  itemName: "",
  itemPrice: 0,
  itemQuantity: 1,
});

function getDefaultFormValues(): SplitsFormSchema {
  return {
    title: "",
    category: "Food & Drink",
    total: 0,
    tax: undefined,
    tip: undefined,
    date: formatDateYmd(),
    time: "",
    location: "",
    includeMe: false,
    creatorAmount: 0,
    rivalIds: [],
    rivalAmounts: {},
    items: [defaultItem()],
  };
}

const SplitForm = () => {
  const colorScheme = useColorScheme();
  const { toast } = useToast();
  const rivals = useQuery(api.rivals.listMyRivals);
  const createSplit = useMutation(api.splits.createSplit);

  const [qtyDraftByRowId, setQtyDraftByRowId] = useState<
    Record<string, string>
  >({});
  const qtyDraftRef = useRef<Record<string, string>>({});
  const dateAffordanceColor = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [participantDrawerOpen, setParticipantDrawerOpen] = useState(false);
  const [amountPopoverOpen, setAmountPopoverOpen] = useState(false);

  const dismissKeyboardAndCloseAmount = (open: boolean) => {
    if (!open) {
      Keyboard.dismiss();
    }
    setAmountPopoverOpen(open);
  };
  const [datePickerWorking, setDatePickerWorking] = useState(() =>
    parseYmdToLocalDate(formatDateYmd()),
  );
  const dateFieldRef = useRef<{
    commit: (ymd: string) => void;
    blur: () => void;
  } | null>(null);
  const datePickerWorkingRef = useRef(datePickerWorking);
  datePickerWorkingRef.current = datePickerWorking;

  const form = useForm<SplitsFormSchema>({
    resolver: zodResolver(splitsFormSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({ control: form.control, name: "items" });
  const category = useWatch({ control: form.control, name: "category" });
  const taxWatched = useWatch({ control: form.control, name: "tax" });
  const tipWatched = useWatch({ control: form.control, name: "tip" });
  const watchedTotal = useWatch({ control: form.control, name: "total" });
  const includeMeWatched = useWatch({
    control: form.control,
    name: "includeMe",
  });
  const rivalIdsWatched = useWatch({ control: form.control, name: "rivalIds" });
  const creatorAmountWatched = useWatch({
    control: form.control,
    name: "creatorAmount",
  });
  const rivalAmountsWatched = useWatch({
    control: form.control,
    name: "rivalAmounts",
  });
  const totalDisplay = (() => {
    const n =
      typeof watchedTotal === "number" ? watchedTotal : Number(watchedTotal);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  })();

  const rivalIdsKey = [...(rivalIdsWatched ?? [])].sort().join(",");

  useEffect(() => {
    const total =
      typeof watchedTotal === "number" ? watchedTotal : Number(watchedTotal);
    if (!Number.isFinite(total) || total < 0) return;
    const includeMe = Boolean(includeMeWatched);
    const rivalIds = rivalIdsWatched ?? [];
    const { creatorAmount, rivalAmounts } = splitAmountsEvenly(
      total,
      includeMe,
      rivalIds,
    );
    form.setValue("creatorAmount", creatorAmount, { shouldValidate: true });
    form.setValue("rivalAmounts", rivalAmounts, { shouldValidate: true });
  }, [watchedTotal, includeMeWatched, rivalIdsKey, form]);

  useEffect(() => {
    if (!items?.length) return;
    const subtotal = items.reduce(
      (acc, row) =>
        acc + (Number(row?.itemPrice) || 0) * (Number(row?.itemQuantity) || 1),
      0,
    );
    const taxAmt =
      typeof taxWatched === "number" && Number.isFinite(taxWatched)
        ? taxWatched
        : 0;
    const tipAmt =
      typeof tipWatched === "number" && Number.isFinite(tipWatched)
        ? tipWatched
        : 0;
    const sum = subtotal + taxAmt + tipAmt;
    form.setValue("total", sum, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [items, taxWatched, tipWatched, form]);

  useEffect(() => {
    if (Platform.OS !== "android" || !datePickerOpen) return;
    void DateTimePickerAndroid.open({
      value: datePickerWorkingRef.current,
      mode: "date",
      display: "default",
      onChange: (event, date) => {
        setDatePickerOpen(false);
        if (event.type === "set" && date) {
          dateFieldRef.current?.commit(formatDateYmd(date));
        }
      },
    });
  }, [datePickerOpen]);

  const categoryOption =
    category != null
      ? { value: category, label: category }
      : { value: SPLIT_CATEGORIES[0], label: SPLIT_CATEGORIES[0] };

  const applyEvenSplit = () => {
    const total =
      typeof watchedTotal === "number" ? watchedTotal : Number(watchedTotal);
    if (!Number.isFinite(total)) return;
    const { creatorAmount, rivalAmounts } = splitAmountsEvenly(
      total,
      Boolean(includeMeWatched),
      rivalIdsWatched ?? [],
    );
    form.setValue("creatorAmount", creatorAmount, { shouldValidate: true });
    form.setValue("rivalAmounts", rivalAmounts, { shouldValidate: true });
    void form.trigger();
  };

  const assignedSum =
    (includeMeWatched ? Number(creatorAmountWatched) || 0 : 0) +
    (rivalIdsWatched ?? []).reduce(
      (acc, id) => acc + (rivalAmountsWatched?.[id] ?? 0),
      0,
    );
  const totalNum =
    typeof watchedTotal === "number" ? watchedTotal : Number(watchedTotal);
  const assignedOk =
    Number.isFinite(totalNum) && Math.abs(assignedSum - totalNum) <= 0.011;
  const remainingAmount = Number.isFinite(totalNum)
    ? Math.max(0, totalNum - assignedSum)
    : 0;
  const overAssigned =
    Number.isFinite(totalNum) && assignedSum - totalNum > 0.011;

  const hasParticipants =
    Boolean(includeMeWatched) || (rivalIdsWatched?.length ?? 0) > 0;

  const onSubmit = async (data: SplitsFormSchema) => {
    try {
      await createSplit({
        title: data.title,
        date: data.date?.trim() || undefined,
        time: data.time?.trim() || undefined,
        location: data.location?.trim() || undefined,
        category: data.category,
        items: data.items.map((row) => ({
          name: row.itemName,
          price: row.itemPrice,
          quantity: row.itemQuantity,
        })),
        tax: data.tax,
        tip: data.tip,
        total: data.total,
        includeMe: data.includeMe,
        creatorAmount: data.includeMe ? data.creatorAmount : 0,
        participants: data.rivalIds.map((rivalId) => ({
          rivalId: rivalId as Id<"rivals">,
          amount: data.rivalAmounts[rivalId] ?? 0,
        })),
      });
      toast.show({
        variant: "success",
        label: "Split dropped like it’s hot",
        description:
          "Your receipt is on the books. Rivals: the tab is real and the vibes are fiscal.",
      });
      qtyDraftRef.current = {};
      setQtyDraftByRowId({});
      form.reset(getDefaultFormValues());
      setDatePickerWorking(parseYmdToLocalDate(formatDateYmd()));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Couldn’t save this split. Try again.";
      toast.show({
        variant: "danger",
        label: "Split failed to launch",
        description: message,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5 px-4 pt-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Manual labor for financial victory.
            </Text>
            <Text className="text-lg text-foreground/50">
              Enter the details of your split and we&apos;ll handle the rest.
            </Text>
          </View>

          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField isRequired isInvalid={Boolean(fieldState.error)}>
                <Label>
                  <Label.Text>Title</Label.Text>
                </Label>
                <InputGroup>
                  <InputGroup.Input
                    placeholder="e.g. Dinner at Luna"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                </InputGroup>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </TextField>
            )}
          />

          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => {
              dateFieldRef.current = {
                commit: field.onChange,
                blur: field.onBlur,
              };
              return (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    Date
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Choose split date"
                    onPress={() => {
                      setDatePickerWorking(parseYmdToLocalDate(field.value));
                      setDatePickerOpen(true);
                    }}
                    className="flex-row items-center gap-3 rounded-xl border border-border bg-background-secondary px-4 py-3 active:opacity-80"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={22}
                        color={dateAffordanceColor}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-medium text-foreground">
                        {formatDateDisplay(field.value)}
                      </Text>
                      {field.value ? (
                        <Text className="mt-0.5 text-xs text-foreground/50">
                          {field.value}
                        </Text>
                      ) : (
                        <Text className="mt-0.5 text-xs text-foreground/45">
                          Tap to open calendar
                        </Text>
                      )}
                    </View>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={20}
                      color={dateAffordanceColor}
                      strokeWidth={1.5}
                    />
                  </Pressable>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </View>
              );
            }}
          />

          <Controller
            control={form.control}
            name="location"
            render={({ field, fieldState }) => (
              <TextField isInvalid={Boolean(fieldState.error)}>
                <Label>
                  <Label.Text>Location (optional)</Label.Text>
                </Label>
                <InputGroup>
                  <InputGroup.Input
                    placeholder="Place or address"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                </InputGroup>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </TextField>
            )}
          />

          <Controller
            control={form.control}
            name="category"
            render={({ field, fieldState }) => (
              <View className="gap-2">
                <Text className="text-sm font-medium text-foreground">
                  Category
                </Text>
                <Select
                  presentation="bottom-sheet"
                  value={categoryOption}
                  onValueChange={(opt) => {
                    const v = opt && "value" in opt ? opt.value : undefined;
                    if (
                      v &&
                      SPLIT_CATEGORIES.includes(
                        v as SplitsFormSchema["category"],
                      )
                    ) {
                      field.onChange(v);
                    }
                  }}
                >
                  <Select.Trigger className="rounded-xl border border-border bg-background-secondary px-4 py-3">
                    <Select.Value placeholder="Choose category" />
                    <Select.TriggerIndicator />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay className="bg-black/40" />
                    <Select.Content
                      presentation="bottom-sheet"
                      className="px-2 pb-8"
                    >
                      <Select.ListLabel className="text-foreground/60 mb-2 px-3 text-xs font-semibold uppercase">
                        Category
                      </Select.ListLabel>
                      {SPLIT_CATEGORIES.map((c) => (
                        <Select.Item
                          key={c}
                          value={c}
                          label={c}
                          className="rounded-xl py-3"
                        >
                          <Select.ItemLabel />
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
                {fieldState.error ? (
                  <Text className="text-sm text-danger">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-foreground">
                Line items
              </Text>
              <Text className="text-sm text-foreground/50">
                Total: ${totalDisplay}
              </Text>
            </View>

            {fields.map((row, index) => (
              <View
                key={row.id}
                className="gap-2 rounded-xl border border-border bg-background-secondary p-3"
              >
                <View className="flex-row gap-2">
                  <View className="min-w-0 flex-1">
                    <Controller
                      control={form.control}
                      name={`items.${index}.itemName`}
                      render={({ field, fieldState }) => (
                        <TextField
                          isInvalid={Boolean(fieldState.error)}
                          className="gap-1"
                        >
                          <Label>
                            <Label.Text className="text-xs">Item</Label.Text>
                          </Label>
                          <InputGroup>
                            <InputGroup.Input
                              placeholder="Name"
                              value={field.value}
                              onChangeText={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </InputGroup>
                          {fieldState.error ? (
                            <FieldError>{fieldState.error.message}</FieldError>
                          ) : null}
                        </TextField>
                      )}
                    />
                  </View>
                  <View className="w-[88px]">
                    <Controller
                      control={form.control}
                      name={`items.${index}.itemPrice`}
                      render={({ field, fieldState }) => (
                        <TextField
                          isInvalid={Boolean(fieldState.error)}
                          className="gap-1"
                        >
                          <Label>
                            <Label.Text className="text-xs">Price</Label.Text>
                          </Label>
                          <InputGroup>
                            <InputGroup.Prefix isDecorative>
                              <Text className="text-foreground/60">$</Text>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                              placeholder="0.00"
                              keyboardType="decimal-pad"
                              value={
                                field.value === 0 ? "" : String(field.value)
                              }
                              onChangeText={(t) => {
                                const cleaned = t.replace(/[^0-9.]/g, "");
                                const n = parseFloat(cleaned);
                                field.onChange(Number.isFinite(n) ? n : 0);
                              }}
                              onBlur={field.onBlur}
                            />
                          </InputGroup>
                          {fieldState.error ? (
                            <FieldError>{fieldState.error.message}</FieldError>
                          ) : null}
                        </TextField>
                      )}
                    />
                  </View>
                  <View className="w-[64px]">
                    <Controller
                      control={form.control}
                      name={`items.${index}.itemQuantity`}
                      render={({ field, fieldState }) => {
                        const rowId = fields[index].id;
                        const hasDraft = Object.prototype.hasOwnProperty.call(
                          qtyDraftByRowId,
                          rowId,
                        );
                        const qtyDisplay = hasDraft
                          ? qtyDraftByRowId[rowId]
                          : String(field.value);
                        return (
                          <TextField
                            isInvalid={Boolean(fieldState.error)}
                            className="gap-1"
                          >
                            <Label>
                              <Label.Text className="text-xs">Qty</Label.Text>
                            </Label>
                            <InputGroup>
                              <InputGroup.Input
                                placeholder="1"
                                keyboardType="number-pad"
                                value={qtyDisplay}
                                onChangeText={(t) => {
                                  const cleaned = t.replace(/[^0-9]/g, "");
                                  qtyDraftRef.current[rowId] = cleaned;
                                  setQtyDraftByRowId((prev) => ({
                                    ...prev,
                                    [rowId]: cleaned,
                                  }));
                                  if (cleaned === "") {
                                    return;
                                  }
                                  const n = parseInt(cleaned, 10);
                                  if (Number.isFinite(n) && n >= 1) {
                                    field.onChange(n);
                                  }
                                }}
                                onBlur={() => {
                                  const raw =
                                    qtyDraftRef.current[rowId] ??
                                    String(field.value);
                                  const cleaned = raw.replace(/[^0-9]/g, "");
                                  const n = parseInt(cleaned, 10);
                                  field.onChange(
                                    Number.isFinite(n) && n >= 1 ? n : 1,
                                  );
                                  delete qtyDraftRef.current[rowId];
                                  setQtyDraftByRowId((prev) => {
                                    if (!(rowId in prev)) return prev;
                                    const next = { ...prev };
                                    delete next[rowId];
                                    return next;
                                  });
                                  field.onBlur();
                                }}
                              />
                            </InputGroup>
                            {fieldState.error ? (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            ) : null}
                          </TextField>
                        );
                      }}
                    />
                  </View>
                </View>
                {fields.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove item ${index + 1}`}
                    onPress={() => {
                      const rowId = fields[index].id;
                      delete qtyDraftRef.current[rowId];
                      setQtyDraftByRowId((prev) => {
                        if (!(rowId in prev)) return prev;
                        const next = { ...prev };
                        delete next[rowId];
                        return next;
                      });
                      remove(index);
                    }}
                    className="self-end py-1"
                  >
                    <Text className="text-sm text-danger">Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add line item"
            onPress={() => append(defaultItem())}
            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 active:opacity-80"
          >
            <HugeiconsIcon icon={Add01Icon} size={22} color="#737373" />
            <Text className="text-base font-medium text-foreground/70">
              Add item
            </Text>
          </Pressable>

          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1">
              <Controller
                control={form.control}
                name="tax"
                render={({ field, fieldState }) => (
                  <TextField isInvalid={Boolean(fieldState.error)}>
                    <Label>
                      <Label.Text>Tax (optional)</Label.Text>
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChangeText={(t) => {
                          const n = parseFloat(t.replace(/[^0-9.]/g, ""));
                          field.onChange(
                            t === "" || Number.isNaN(n) ? undefined : n,
                          );
                        }}
                        onBlur={field.onBlur}
                      />
                    </InputGroup>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </TextField>
                )}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Controller
                control={form.control}
                name="tip"
                render={({ field, fieldState }) => (
                  <TextField isInvalid={Boolean(fieldState.error)}>
                    <Label>
                      <Label.Text>Tip (optional)</Label.Text>
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChangeText={(t) => {
                          const n = parseFloat(t.replace(/[^0-9.]/g, ""));
                          field.onChange(
                            t === "" || Number.isNaN(n) ? undefined : n,
                          );
                        }}
                        onBlur={field.onBlur}
                      />
                    </InputGroup>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </TextField>
                )}
              />
            </View>
          </View>

          {form.formState.errors.root ? (
            <Text className="text-sm text-danger">
              {form.formState.errors.root.message}
            </Text>
          ) : null}

          <View>
            <Controller
              control={form.control}
              name={"total"}
              render={({ field, fieldState }) => (
                <TextField isInvalid={Boolean(fieldState.error)}>
                  <Label>
                    <Label.Text>Total amount</Label.Text>
                  </Label>
                  <InputGroup>
                    <InputGroup.Prefix isDecorative>
                      <Text className="text-foreground/60">$</Text>
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={
                        field.value === undefined ||
                        field.value === null ||
                        Number(field.value) === 0
                          ? ""
                          : String(field.value)
                      }
                      onChangeText={(t) => {
                        const cleaned = t.replace(/[^0-9.]/g, "");
                        const n = parseFloat(cleaned);
                        field.onChange(Number.isFinite(n) ? n : 0);
                      }}
                      onBlur={field.onBlur}
                    />
                  </InputGroup>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </TextField>
              )}
            />
          </View>

          <Popover
            presentation="bottom-sheet"
            isOpen={amountPopoverOpen}
            onOpenChange={dismissKeyboardAndCloseAmount}
          >
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                Split with
              </Text>
              <Text className="text-xs text-foreground/50">
                Add yourself and rivals, then assign how much each person owes.
              </Text>
              <View className="mt-2 gap-2">
                <View className="flex-row flex-wrap items-center gap-3">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add people to this split"
                    onPress={() => {
                      Keyboard.dismiss();
                      setParticipantDrawerOpen(true);
                    }}
                    style={{ borderStyle: "dashed" }}
                    className="h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-foreground/35 bg-surface/40 active:opacity-80"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={22} color="#737373" />
                  </Pressable>
                  {includeMeWatched ? (
                    <View className="relative">
                      <Avatar
                        alt="You"
                        size="lg"
                        variant="soft"
                        color="accent"
                        accessibilityLabel="You on this split"
                      >
                        <Avatar.Fallback className="text-base font-bold">
                          ME
                        </Avatar.Fallback>
                      </Avatar>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Remove yourself from this split"
                        hitSlop={8}
                        onPress={() =>
                          form.setValue("includeMe", false, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="absolute -right-0.5 -top-0.5 h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm active:opacity-80"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={12}
                          color="#737373"
                        />
                      </Pressable>
                    </View>
                  ) : null}
                  {(rivalIdsWatched ?? []).map((rid) => {
                    const r = rivals?.find((x) => x._id === rid);
                    const displayName = r?.nickname ?? r?.name ?? "Rival";
                    return (
                      <View key={rid} className="relative">
                        <Avatar
                          alt={displayName}
                          size="lg"
                          variant="soft"
                          color="accent"
                          accessibilityLabel={displayName}
                        >
                          {r?.image ? (
                            <Avatar.Image source={{ uri: r.image }} />
                          ) : null}
                          <Avatar.Fallback className="text-base font-bold">
                            {getInitials(displayName)}
                          </Avatar.Fallback>
                        </Avatar>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${displayName} from this split`}
                          hitSlop={8}
                          onPress={() => {
                            const next = (rivalIdsWatched ?? []).filter(
                              (id) => id !== rid,
                            );
                            form.setValue("rivalIds", next, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          className="absolute -right-0.5 -top-0.5 h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm active:opacity-80"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={12}
                            color="#737373"
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
                {!hasParticipants ? (
                  <Text className="text-sm text-foreground/50">
                    Tap the + to choose yourself and rivals.
                  </Text>
                ) : null}
              </View>
              <View className="gap-1.5 mt-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  isDisabled={!hasParticipants}
                  onPress={() => {
                    if (!hasParticipants) return;
                    setAmountPopoverOpen(true);
                  }}
                >
                  <Button.Label>Assign money</Button.Label>
                </Button>
                {!hasParticipants ? (
                  <Text className="text-xs text-foreground/50">
                    Add people first, then you can split the bill.
                  </Text>
                ) : null}
              </View>
              {form.formState.errors.rivalIds ? (
                <FieldError>
                  {form.formState.errors.rivalIds.message}
                </FieldError>
              ) : null}
            </View>

            <Popover.Portal>
              <Popover.Overlay />
              <Popover.Content
                presentation="bottom-sheet"
                snapPoints={["88%"]}
                enableDynamicSizing={false}
                enableContentPanningGesture={false}
                backgroundClassName="rounded-t-3xl"
                handleIndicatorClassName="bg-foreground/20"
              >
                <Popover.Title className="px-4 pb-1 pt-2 text-lg font-semibold text-foreground">
                  Who owes what
                </Popover.Title>
                <Popover.Description className="px-4 pb-2 text-sm text-foreground/60">
                  Total $
                  {Number.isFinite(totalNum) ? totalNum.toFixed(2) : "0.00"} ·
                  Assigned ${assignedSum.toFixed(2)} · Remaining $
                  {remainingAmount.toFixed(2)}
                  {assignedOk ? " (balanced)" : ""}.
                </Popover.Description>
                <View className="gap-1 px-4 pb-2">
                  <Text
                    className={`text-sm font-semibold ${overAssigned ? "text-danger" : "text-foreground"}`}
                  >
                    Remaining: ${remainingAmount.toFixed(2)} of $
                    {Number.isFinite(totalNum) ? totalNum.toFixed(2) : "0.00"}
                  </Text>
                  {overAssigned ? (
                    <Text className="text-xs text-danger">
                      Assigned cannot exceed the bill total.
                    </Text>
                  ) : null}
                </View>
                <ScrollView
                  className="max-h-[480px] px-4"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {includeMeWatched ? (
                    <Controller
                      control={form.control}
                      name="creatorAmount"
                      render={({ field, fieldState }) => (
                        <TextField
                          isInvalid={Boolean(fieldState.error)}
                          className="mb-3"
                        >
                          <Label>
                            <Label.Text>Me</Label.Text>
                          </Label>
                          <InputGroup>
                            <InputGroup.Prefix isDecorative>
                              <Text className="text-foreground/60">$</Text>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                              placeholder="0.00"
                              keyboardType="decimal-pad"
                              value={
                                field.value === 0
                                  ? ""
                                  : String(field.value ?? "")
                              }
                              onChangeText={(t) => {
                                const cleaned = t.replace(/[^0-9.]/g, "");
                                const n = parseFloat(cleaned);
                                const capped = clampMeAmount(
                                  Number.isFinite(n) ? n : 0,
                                  Number.isFinite(totalNum) ? totalNum : 0,
                                  rivalIdsWatched ?? [],
                                  rivalAmountsWatched,
                                );
                                field.onChange(capped);
                              }}
                              onBlur={field.onBlur}
                            />
                          </InputGroup>
                          {fieldState.error ? (
                            <FieldError>{fieldState.error.message}</FieldError>
                          ) : null}
                        </TextField>
                      )}
                    />
                  ) : null}
                  {(rivalIdsWatched ?? []).map((rid) => {
                    const r = rivals?.find((x) => x._id === rid);
                    const label = r ? (r.nickname ?? r.name) : "Rival";
                    return (
                      <Controller
                        key={rid}
                        control={form.control}
                        name={`rivalAmounts.${rid}` as const}
                        render={({ field, fieldState }) => (
                          <TextField
                            isInvalid={Boolean(fieldState.error)}
                            className="mb-3"
                          >
                            <Label>
                              <Label.Text>{label}</Label.Text>
                            </Label>
                            <InputGroup>
                              <InputGroup.Prefix isDecorative>
                                <Text className="text-foreground/60">$</Text>
                              </InputGroup.Prefix>
                              <InputGroup.Input
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={
                                  field.value === 0 || field.value === undefined
                                    ? ""
                                    : String(field.value)
                                }
                                onChangeText={(t) => {
                                  const cleaned = t.replace(/[^0-9.]/g, "");
                                  const n = parseFloat(cleaned);
                                  const capped = clampRivalAmount(
                                    Number.isFinite(n) ? n : 0,
                                    Number.isFinite(totalNum) ? totalNum : 0,
                                    Boolean(includeMeWatched),
                                    Number(creatorAmountWatched) || 0,
                                    rivalIdsWatched ?? [],
                                    rivalAmountsWatched,
                                    rid,
                                  );
                                  field.onChange(capped);
                                }}
                                onBlur={field.onBlur}
                              />
                            </InputGroup>
                            {fieldState.error ? (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            ) : null}
                          </TextField>
                        )}
                      />
                    );
                  })}
                </ScrollView>
                <View className="gap-2 border-t border-border px-4 pb-6 pt-3">
                  <Button variant="tertiary" onPress={applyEvenSplit}>
                    <Button.Label>Split evenly</Button.Label>
                  </Button>
                  <Button
                    variant="primary"
                    onPress={() => dismissKeyboardAndCloseAmount(false)}
                  >
                    <Button.Label>Done</Button.Label>
                  </Button>
                </View>
              </Popover.Content>
            </Popover.Portal>
          </Popover>

          <Button
            onPress={form.handleSubmit(onSubmit)}
            isDisabled={form.formState.isSubmitting}
            className="mt-2 rounded-xl "
          >
            {!form.formState.isSubmitting ? (
              <View className="flex-row items-center gap-1 justify-center">
                <Text className="text-lg text-foreground/90">Saving</Text>

                <Spinner className="flex-row items-center justify-center">
                  <Spinner.Indicator>
                    <HugeiconsIcon
                      icon={Loading02Icon}
                      size={20}
                      color={colorScheme === "dark" ? "#ffffff" : "#000000"}
                    />
                  </Spinner.Indicator>
                </Spinner>
              </View>
            ) : (
              <>
                <Button.Label className="text-base font-bold">
                  Save split
                </Button.Label>
                <HugeiconsIcon icon={SaveIcon} size={20} color="#ffffff" />
              </>
            )}
          </Button>
        </View>
      </ScrollView>

      <BottomSheet
        isOpen={participantDrawerOpen}
        onOpenChange={(open) => {
          setParticipantDrawerOpen(open);
          if (!open) Keyboard.dismiss();
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["78%"]}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
            backgroundClassName="rounded-t-3xl"
            handleIndicatorClassName="bg-foreground/20"
          >
            <BottomSheet.Title className="px-4 pb-1 pt-2 text-lg font-semibold text-foreground">
              Add people
            </BottomSheet.Title>
            <BottomSheet.Description className="px-4 pb-3 text-sm text-foreground/60">
              Tap cards to include yourself and anyone you&apos;re splitting
              with. Rivals come from your Rivals list.
            </BottomSheet.Description>
            <ScrollView
              className="max-h-[420px] px-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Controller
                control={form.control}
                name="includeMe"
                render={({ field }) => (
                  <Card
                    className={`mb-3 overflow-hidden border ${field.value ? "border-accent" : "border-border"}`}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: field.value }}
                      onPress={() => field.onChange(!field.value)}
                      className="flex-row items-center gap-3 p-3 active:opacity-90"
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                        <Text className="text-base font-bold text-foreground">
                          Me
                        </Text>
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="font-semibold text-foreground">
                          Yourself
                        </Text>
                        <Text className="text-xs text-foreground/50">
                          Include your share of the bill
                        </Text>
                      </View>
                      <Text className="text-lg text-accent">
                        {field.value ? "✓" : ""}
                      </Text>
                    </Pressable>
                  </Card>
                )}
              />
              {rivals === undefined ? (
                <Text className="py-4 text-sm text-foreground/60">
                  Loading rivals…
                </Text>
              ) : rivals.length === 0 ? (
                <Text className="py-2 text-sm text-foreground/60">
                  No rivals yet. Add people from the Rivals tab to include them
                  here.
                </Text>
              ) : (
                <Controller
                  control={form.control}
                  name="rivalIds"
                  render={({ field: rivalField }) => (
                    <View className="gap-2 pb-2">
                      {rivals.map((r) => {
                        const displayName = r.nickname ?? r.name;
                        const selected = rivalField.value.includes(r._id);
                        return (
                          <Card
                            key={r._id}
                            className={`overflow-hidden border ${selected ? "border-accent" : "border-border"}`}
                          >
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected }}
                              accessibilityLabel={`${selected ? "Remove" : "Add"} ${displayName}`}
                              onPress={() => {
                                const next = selected
                                  ? rivalField.value.filter(
                                      (id) => id !== r._id,
                                    )
                                  : [...rivalField.value, r._id];
                                rivalField.onChange(next);
                              }}
                              className="flex-row items-center gap-3 p-3 active:opacity-90"
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
                              <Text
                                className="min-w-0 flex-1 font-semibold text-foreground"
                                numberOfLines={1}
                              >
                                {displayName}
                              </Text>
                              <Text className="text-lg text-accent">
                                {selected ? "✓" : ""}
                              </Text>
                            </Pressable>
                          </Card>
                        );
                      })}
                    </View>
                  )}
                />
              )}
            </ScrollView>
            <View className="border-t border-border px-4 pb-6 pt-3">
              <Button
                variant="primary"
                onPress={() => {
                  setAmountPopoverOpen(false);
                  Keyboard.dismiss();
                  setParticipantDrawerOpen(false);
                }}
              >
                <Button.Label>Done</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      <BottomSheet
        isOpen={datePickerOpen}
        onOpenChange={(open) => {
          setDatePickerOpen(open);
          if (!open) void dateFieldRef.current?.blur();
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["52%"]}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
            backgroundClassName="rounded-t-3xl"
            handleIndicatorClassName="bg-foreground/20"
          >
            <BottomSheet.Title className="px-4 pb-1 pt-2 text-lg font-semibold text-foreground">
              Split date
            </BottomSheet.Title>
            <BottomSheet.Description className="px-4 pb-3 text-sm text-foreground/60">
              Choose when this expense happened.
            </BottomSheet.Description>

            {Platform.OS === "ios" ? (
              <View
                className="items-stretch px-3"
                collapsable={false}
                style={{ width: "100%", minHeight: 216 }}
              >
                <DateTimePicker
                  value={datePickerWorking}
                  mode="date"
                  display="spinner"
                  themeVariant={colorScheme === "dark" ? "dark" : "light"}
                  style={{ width: "100%", height: 216 }}
                  onChange={(_event, date) => {
                    if (date) setDatePickerWorking(date);
                  }}
                />
              </View>
            ) : (
              <Text className="px-4 pb-3 text-sm text-foreground/60">
                Use the system date dialog to pick.
              </Text>
            )}

            {Platform.OS === "ios" ? (
              <View className="mt-2 flex-row justify-end gap-2 border-t border-border px-4 pb-6 pt-3">
                <Button
                  variant="ghost"
                  onPress={() => setDatePickerOpen(false)}
                >
                  <Button.Label>Cancel</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  onPress={() => {
                    dateFieldRef.current?.commit(
                      formatDateYmd(datePickerWorking),
                    );
                    setDatePickerOpen(false);
                  }}
                >
                  <Button.Label>Done</Button.Label>
                </Button>
              </View>
            ) : (
              <View className="border-t border-border px-4 pb-6 pt-3">
                <Button
                  variant="tertiary"
                  onPress={() => setDatePickerOpen(false)}
                >
                  <Button.Label>Close</Button.Label>
                </Button>
              </View>
            )}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
};

export default SplitForm;
