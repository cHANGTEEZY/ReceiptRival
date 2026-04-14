import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const createSplit = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
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
    completion_status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    rivalIds: v.array(v.id("rivals")),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    for (const rivalId of args.rivalIds) {
      const rival = await ctx.db.get(rivalId);
      if (!rival || rival.userId !== me._id) {
        throw new ConvexError("Invalid rival");
      }
    }

    const now = Date.now();
    const splitId = await ctx.db.insert("splits", {
      title: args.title,
      date: args.date,
      time: args.time,
      location: args.location ?? "",
      category: args.category,
      items: args.items,
      tax: args.tax,
      tip: args.tip,
      total: args.total,
      userId: me._id,
      createdAt: now,
      completion_status: "pending",
      updatedAt: now,
    });

    const shareEach =
      args.rivalIds.length > 0 ? args.total / args.rivalIds.length : 0;

    for (const rivalId of args.rivalIds) {
      await ctx.db.insert("splitParticipants", {
        splitId,
        rivalId,
        amount: shareEach,
        paid: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return splitId;
  },
});

export const getAllSplits = query({
  args: {},
  handler: async (ctx) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rows = await ctx.db
      .query("splits")
      .withIndex("userId", (q) => q.eq("userId", me._id))
      .collect();

    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});