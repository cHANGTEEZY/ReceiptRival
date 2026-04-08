import { z } from "zod";

export const SPLIT_CATEGORIES = [
  "Food & Drink",
  "Shopping",
  "Transport",
  "Entertainment",
  "Other",
] as const;

export type SplitCategory = (typeof SPLIT_CATEGORIES)[number];

export const splitsFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  category: z.enum(SPLIT_CATEGORIES),
  total: z.number().min(0),
  tax: z.number().optional(),
  tip: z.number().optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1, { message: "Item name is required" }),
        itemPrice: z
          .number()
          .positive({ message: "Price must be greater than 0" }),
        itemQuantity: z.number().int().min(1),
      }),
    )
    .min(1, { message: "Add at least one line item" }),
});

export type SplitsFormSchema = z.infer<typeof splitsFormSchema>;
