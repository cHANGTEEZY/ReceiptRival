import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  //* Your contact/friends list — "add user as rival"
  rivals: defineTable({
    // Better Auth component user document ids (opaque strings, not root `users` table)
    userId: v.string(),
    rivalUserId: v.string(),
    nickname: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("rivalUserId", ["rivalUserId"])
    .index("by_user_rival", ["userId", "rivalUserId"]),

  // The bill/expense
  splits: defineTable({
    title: v.string(),
    date: v.optional(v.string()),
    location: v.string(),
    category: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
      })
    ),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    total: v.number(),
    userId: v.id("users"), // creator
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  // Junction table: who owes what in a split + payment status
  splitParticipants: defineTable({
    splitId: v.id("splits"), 
    rivalId: v.id("rivals"),
    amount: v.number(),          // their share
    paid: v.boolean(),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("splitId", ["splitId"])
    .index("rivalId", ["rivalId"]),
});

export default schema;