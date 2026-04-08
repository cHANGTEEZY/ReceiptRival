import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { KeyboardAvoidingWrapper } from "../../components/SafeAreaWrapper";
import {
  Button,
  FieldError,
  InputGroup,
  Label,
  Select,
  TextField,
} from "heroui-native";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  type SplitsFormSchema,
  SPLIT_CATEGORIES,
  splitsFormSchema,
} from "./schema";

const defaultItem = (): SplitsFormSchema["items"][number] => ({
  itemName: "",
  itemPrice: 0,
  itemQuantity: 1,
});

const SplitForm = () => {
  const form = useForm<SplitsFormSchema>({
    resolver: zodResolver(splitsFormSchema),
    defaultValues: {
      title: "",
      category: "Food & Drink",
      total: 0,
      tax: undefined,
      tip: undefined,
      date: undefined,
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
                Total: ${form.watch("total").toFixed(2)}
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

          {form.formState.errors.root ? (
            <Text className="text-sm text-danger">
              {form.formState.errors.root.message}
            </Text>
          ) : null}

          <Button
            onPress={form.handleSubmit(onSubmit)}
            isDisabled={form.formState.isSubmitting}
            className="mt-2 rounded-xl"
          >
            <Button.Label>Save split</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SplitForm;
