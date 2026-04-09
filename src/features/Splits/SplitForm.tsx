import React, { useEffect, useRef, useState } from "react";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import {
  BottomSheet,
  Button,
  FieldError,
  InputGroup,
  Label,
  Select,
  TextField,
} from "heroui-native";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add01Icon,
  ArrowDown01Icon,
  Calendar03Icon,
  SaveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  type SplitsFormSchema,
  SPLIT_CATEGORIES,
  splitsFormSchema,
} from "./schema";

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

const defaultItem = (): SplitsFormSchema["items"][number] => ({
  itemName: "",
  itemPrice: 0,
  itemQuantity: 1,
});

const SplitForm = () => {
  const colorScheme = useColorScheme();
  const dateAffordanceColor = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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
    defaultValues: {
      title: "",
      category: "Food & Drink",
      total: 0,
      tax: undefined,
      tip: undefined,
      date: formatDateYmd(),
      time: "",
      location: "",
      items: [defaultItem()],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({ control: form.control, name: "items" });
  const category = useWatch({ control: form.control, name: "category" });
  const watchedTotal = useWatch({ control: form.control, name: "total" });
  const totalDisplay = (() => {
    const n =
      typeof watchedTotal === "number" ? watchedTotal : Number(watchedTotal);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  })();

  useEffect(() => {
    if (!items?.length) return;
    const sum = items.reduce(
      (acc, row) =>
        acc + (Number(row?.itemPrice) || 0) * (Number(row?.itemQuantity) || 1),
      0,
    );
    form.setValue("total", sum, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [items, form]);

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

  const onSubmit = (data: SplitsFormSchema) => {
    console.log("Split form:", data);
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
                  <View className="w-[110px]">
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
                </View>
                {fields.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove item ${index + 1}`}
                    onPress={() => remove(index)}
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

          <Button
            onPress={form.handleSubmit(onSubmit)}
            isDisabled={form.formState.isSubmitting}
            className="mt-2 rounded-xl "
          >
            <Button.Label className="text-base font-bold">
              Save split
            </Button.Label>
            <HugeiconsIcon icon={SaveIcon} size={20} color="#ffffff" />
          </Button>
        </View>
      </ScrollView>

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
