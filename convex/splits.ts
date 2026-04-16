import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { components } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { Doc as UserDoc } from "./betterAuth/_generated/dataModel";

type RivalDoc = Doc<"rivals">;

const AMOUNT_TOLERANCE = 0.01;

function assertAmountsBalance(
  total: number,
  includeMe: boolean,
  creatorAmount: number,
  participantSum: number,
) {
  const sum = (includeMe ? creatorAmount : 0) + participantSum;
  if (Math.abs(sum - total) > AMOUNT_TOLERANCE) {
    throw new ConvexError(
      "Amounts must add up to the split total (within $0.01).",
    );
  }
}

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
    includeMe: v.boolean(),
    creatorAmount: v.number(),
    participants: v.array(
      v.object({
        rivalId: v.id("rivals"),
        amount: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    if (!args.includeMe && args.participants.length === 0) {
      throw new ConvexError(
        "Select at least yourself or one rival to split with.",
      );
    }

    if (!args.includeMe && args.creatorAmount !== 0) {
      throw new ConvexError("Creator amount must be zero when you are not included.");
    }

    if (args.includeMe && args.participants.length === 0) {
      if (Math.abs(args.creatorAmount - args.total) > AMOUNT_TOLERANCE) {
        throw new ConvexError(
          "Your amount must equal the total when splitting with no rivals.",
        );
      }
    }

    const participantSum = args.participants.reduce((a, p) => a + p.amount, 0);
    assertAmountsBalance(
      args.total,
      args.includeMe,
      args.creatorAmount,
      participantSum,
    );

    const seenRival = new Set<Id<"rivals">>();
    const rivalById = new Map<Id<"rivals">, RivalDoc>();

    for (const row of args.participants) {
      if (seenRival.has(row.rivalId)) {
        throw new ConvexError("Duplicate rival in split.");
      }
      seenRival.add(row.rivalId);
      const rival = await ctx.db.get(row.rivalId);
      if (!rival || rival.userId !== me._id) {
        throw new ConvexError("Invalid rival");
      }
      if (row.amount < 0) {
        throw new ConvexError("Amounts cannot be negative.");
      }
      rivalById.set(row.rivalId, rival);
    }

    if (args.includeMe && args.creatorAmount < 0) {
      throw new ConvexError("Your amount cannot be negative.");
    }

    const now = Date.now();
    const creatorAmountStored = args.includeMe ? args.creatorAmount : 0;

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
      creatorAmount: creatorAmountStored,
      userId: me._id,
      createdAt: now,
      completion_status: "pending",
      updatedAt: now,
    });

    for (const row of args.participants) {
      const rival = rivalById.get(row.rivalId);
      if (!rival) {
        throw new ConvexError("Invalid rival");
      }
      await ctx.db.insert("splitParticipants", {
        splitId,
        rivalId: row.rivalId,
        participantUserId: rival.rivalUserId,
        amount: row.amount,
        paid: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return splitId;
  },
});

/** Splits you created (all). */
export const getMySplits = query({
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

/** Alias for clients still using getAllSplits. */
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

/**
 * Splits where you have a positive assigned amount:
 * - You were added as a rival (participant), or
 * - You created the split and gave yourself a "Me" share (creatorAmount > 0).
 */
export const getAssignedSplits = query({
  args: {},
  handler: async (ctx) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const merged = new Map<
      Id<"splits">,
      { split: Doc<"splits">; assignedAmount: number }
    >();

    const participantRows = await ctx.db
      .query("splitParticipants")
      .withIndex("by_participantUserId", (q) =>
        q.eq("participantUserId", me._id),
      )
      .collect();

    for (const p of participantRows) {
      const split = await ctx.db.get(p.splitId);
      if (!split) continue;
      merged.set(split._id, {
        split,
        assignedAmount: p.amount,
      });
    }

    const mySplits = await ctx.db
      .query("splits")
      .withIndex("userId", (q) => q.eq("userId", me._id))
      .collect();

    for (const s of mySplits) {
      const ca = s.creatorAmount ?? 0;
      if (ca <= 0) continue;
      const existing = merged.get(s._id);
      if (existing) {
        existing.assignedAmount += ca;
      } else {
        merged.set(s._id, { split: s, assignedAmount: ca });
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) => b.split.createdAt - a.split.createdAt,
    );
  },
});

/** Split + participants for the receipt detail screen (creator or assigned rival only). */
export const getSplitDetail = query({
  args: { splitId: v.id("splits") },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }
    const meId = String(me._id);

    const split = await ctx.db.get(args.splitId);
    if (!split) {
      return null;
    }

    const participants = await ctx.db
      .query("splitParticipants")
      .withIndex("splitId", (q) => q.eq("splitId", args.splitId))
      .collect();

    const isCreator = split.userId === meId;
    const isParticipant = participants.some(
      (p) => p.participantUserId === meId,
    );
    if (!isCreator && !isParticipant) {
      throw new ConvexError("You don't have access to this split.");
    }

    const rivalDocs = await Promise.all(
      participants.map((p) => ctx.db.get(p.rivalId)),
    );

    const userIds = new Set<string>();
    userIds.add(split.userId);
    for (let i = 0; i < participants.length; i++) {
      const r = rivalDocs[i];
      if (r) userIds.add(r.rivalUserId);
    }

    const ids = [...userIds];
    const { page: users } = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "user",
        paginationOpts: { cursor: null, numItems: 200 },
        where: [{ field: "_id", operator: "in", value: ids }],
      },
    );

    const byId = new Map<string, UserDoc<"user">>(
      (users as UserDoc<"user">[]).map((u) => [u._id, u]),
    );

    const creatorAmount = split.creatorAmount ?? 0;

    const rivals = participants
      .map((p, i) => {
        const rival = rivalDocs[i];
        if (!rival) return null;
        const u = byId.get(rival.rivalUserId);
        return {
          participantId: p._id,
          amount: p.amount,
          paid: p.paid,
          paidAt: p.paidAt,
          displayName: rival.nickname ?? u?.name ?? "Rival",
          image: u?.image ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const creatorUser = byId.get(split.userId);
    const creatorRow =
      creatorAmount > AMOUNT_TOLERANCE
        ? {
            amount: creatorAmount,
            settled: split.completion_status === "completed",
            displayName: isCreator ? "You" : (creatorUser?.name ?? "Host"),
            image: creatorUser?.image ?? null,
          }
        : null;

    const settledCount =
      (creatorRow?.settled ? 1 : 0) + rivals.filter((r) => r.paid).length;
    const totalPeople = (creatorRow ? 1 : 0) + rivals.length;

    return {
      split,
      creatorRow,
      rivals,
      viewerIsCreator: isCreator,
      settledCount,
      totalPeople,
    };
  },
});
