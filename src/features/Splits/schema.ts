import { z } from "zod";

export const SPLIT_CATEGORIES = [
  "Food & Drink",
  "Shopping",
  "Transport",
  "Entertainment",
  "Other",
] as const;

export type SplitCategory = (typeof SPLIT_CATEGORIES)[number];

const TOTAL_TOLERANCE = 0.01;

export const splitsFormSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    category: z.enum(SPLIT_CATEGORIES),
    total: z.number().min(0),
    tax: z.number().optional(),
    tip: z.number().optional(),
    date: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val?.trim() ||
          /^\d{4}-\d{2}-\d{2}$/.test(val.trim()),
        { message: "Use YYYY-MM-DD" },
      ),
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
    /** Include your share in the split (default on). */
    includeMe: z.boolean(),
    /** Your share when includeMe is true. */
    creatorAmount: z.number().min(0),
    /** Convex `rivals` document ids — tap rivals in the UI to add/remove */
    rivalIds: z.array(z.string()),
    /** Amount each selected rival owes, keyed by rival document id */
    rivalAmounts: z.record(z.string(), z.number()),
  })
  .superRefine((data, ctx) => {
    const subtotal = data.items.reduce(
      (acc, row) => acc + row.itemPrice * row.itemQuantity,
      0,
    );
    const taxAmt = data.tax ?? 0;
    const tipAmt = data.tip ?? 0;
    const expected = subtotal + taxAmt + tipAmt;
    if (Math.abs(data.total - expected) > TOTAL_TOLERANCE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total must match line items plus tax and tip ($${expected.toFixed(2)})`,
        path: ["total"],
      });
    }

    if (!data.includeMe && data.rivalIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select yourself or at least one rival.",
        path: ["rivalIds"],
      });
    }

    if (!data.includeMe && data.creatorAmount > TOTAL_TOLERANCE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Turn off “Me” only if your share is $0.",
        path: ["creatorAmount"],
      });
    }

    for (const id of data.rivalIds) {
      const amt = data.rivalAmounts[id];
      if (amt === undefined || Number.isNaN(amt)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Set an amount for each person in “Who owes what”.",
          path: ["rivalAmounts"],
        });
        break;
      }
      if (amt < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amounts cannot be negative.",
          path: ["rivalAmounts"],
        });
        break;
      }
    }

    const rivalSum = data.rivalIds.reduce(
      (acc, id) => acc + (data.rivalAmounts[id] ?? 0),
      0,
    );
    const myPart = data.includeMe ? data.creatorAmount : 0;
    const sum = myPart + rivalSum;

    if (sum - data.total > TOTAL_TOLERANCE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Assigned amounts cannot exceed the bill total of $${data.total.toFixed(2)} (currently $${sum.toFixed(2)}).`,
        path: ["root"],
      });
      return;
    }

    if (data.total - sum > TOTAL_TOLERANCE) {
      const left = data.total - sum;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Still $${left.toFixed(2)} left to assign (assigned $${sum.toFixed(2)} of $${data.total.toFixed(2)}).`,
        path: ["root"],
      });
    }
  });

export type SplitsFormSchema = z.infer<typeof splitsFormSchema>;
