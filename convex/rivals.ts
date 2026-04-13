import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { components } from "./_generated/api";
import type { Doc } from "./betterAuth/_generated/dataModel";

export const getUsers = query({
  handler: async (ctx) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const { page } = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "user",
      paginationOpts: { cursor: null, numItems: 200 },
    });

    // filter users that are not in rivasl table and is not me
    const users = page.filter((user: Doc<"user">) => user._id !== me._id);
    const rivals = await ctx.db.query("rivals").withIndex("userId", (q) => q.eq("userId", me._id)).collect();
    return users.filter((user: Doc<"user">) => !rivals.some((rival) => rival.rivalUserId === user._id));
  },
});

export const addRival = mutation({
  args: {
    rivalUserId: v.string(),
    nickname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    if (args.rivalUserId === me._id) {
      throw new ConvexError("You cannot add yourself as a rival.");
    }

    const nickname =
      args.nickname !== undefined
        ? args.nickname.trim() || undefined
        : undefined;

    const existing = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", me._id).eq("rivalUserId", args.rivalUserId),
      )
      .unique();

    if (existing) {
      throw new ConvexError("This user is already on your rivals list.");
    }

    const now = Date.now();
    const myRowId = await ctx.db.insert("rivals", {
      userId: me._id,
      rivalUserId: args.rivalUserId,
      nickname,
      rivalStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Mirror so both users see each other on their rivals list.
    const reverse = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", args.rivalUserId).eq("rivalUserId", me._id),
      )
      .unique();
    if (!reverse) {
      await ctx.db.insert("rivals", {
        userId: args.rivalUserId,
        rivalUserId: me._id,
        rivalStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
    }

    return myRowId;
  },
});

/** Rivals on your list (each connection is stored both ways). */
export const listMyRivals = query({
  handler: async (ctx) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rows = await ctx.db
      .query("rivals")
      .withIndex("userId", (q) => q.eq("userId", me._id))
      .collect();

    if (rows.length === 0) {
      return [];
    }

    const ids = [...new Set(rows.map((r) => r.rivalUserId))];
    const { page: users } = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "user",
        paginationOpts: { cursor: null, numItems: 200 },
        where: [{ field: "_id", operator: "in", value: ids }],
      },
    );

    const byId = new Map<string, Doc<"user">>(
      users.map((u: Doc<"user">) => [u._id, u]),
    );

    const enriched = rows.map((row) => {
      const u = byId.get(row.rivalUserId);
      return {
        _id: row._id,
        rivalUserId: row.rivalUserId,
        nickname: row.nickname,
        createdAt: row.createdAt,
        name: u?.name ?? "Unknown user",
        email: u?.email ?? "",
        image: u?.image ?? null,
      };
    });

    enriched.sort((a, b) => {
      const labelA = (a.nickname ?? a.name).toLowerCase();
      const labelB = (b.nickname ?? b.name).toLowerCase();
      return labelA.localeCompare(labelB);
    });

    return enriched;
  },
});

export const getRival = query({
  args: {
    rivalUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db.query("rivals").withIndex("by_user_rival", (q) => q.eq("userId", me._id).eq("rivalUserId", args.rivalUserId)).unique();
    
    const filteredRival = rival?.rivalStatus === "accepted" ? rival : null

    if (!filteredRival) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    return filteredRival;
  },
});

export const acceptRival = mutation({
  args: {
    rivalId: v.id("rivals"),
  },handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db.get(args.rivalId);
    if (!rival) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    if (rival.rivalStatus === "accepted") {
      throw new ConvexError("This user is already accepted.");
    }

    await ctx.db.patch(args.rivalId, {
      rivalStatus: "accepted",
    });

    return rival;
  },
})

export const rejectRival = mutation({
  args: {
    rivalId: v.id("rivals"),
  },handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db.get(args.rivalId);
    if (!rival) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    if (rival.rivalStatus === "accepted") {
      throw new ConvexError("This user is already accepted.");
    }

    await ctx.db.patch(args.rivalId, {
      rivalStatus: "rejected",
    });

    return rival;
  },
})

export const removeRival = mutation({
  args: {
    rivalUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", me._id).eq("rivalUserId", args.rivalUserId),
      )
      .unique();
    if (!rival) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    await ctx.db.delete(rival._id);

    const reverse = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", args.rivalUserId).eq("rivalUserId", me._id),
      )
      .unique();
    if (reverse) {
      await ctx.db.delete(reverse._id);
    }
  },
});