import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  rivals: defineTable({
    userId: v.string(),
    rivalUserId: v.string(),
    nickname: v.optional(v.string()),
    invitedByUserId: v.optional(v.string()),
    // Optional only for legacy rows; run `internal.rivals.backfillRivalStatus` once, then make required again.
    rivalStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("rivalUserId", ["rivalUserId"])
    .index("by_user_rival", ["userId", "rivalUserId"]),

  splits: defineTable({
    title: v.string(),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.string(),
    category: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    total: v.number(),
    /** Creator's share of `total` when "Me" is included; 0 otherwise. Optional for legacy rows. */
    creatorAmount: v.optional(v.number()),
    completion_status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  splitParticipants: defineTable({
    splitId: v.id("splits"),
    rivalId: v.id("rivals"),
    /** Denormalized from rivals.rivalUserId for "assigned to me" queries. Optional for legacy rows. */
    participantUserId: v.optional(v.string()),
    amount: v.number(),
    paid: v.boolean(),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("splitId", ["splitId"])
    .index("rivalId", ["rivalId"])
    .index("by_participantUserId", ["participantUserId"]),
});

export default schema;