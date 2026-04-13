import type { PaginationResult } from "convex/server";
import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { authComponent } from "./auth";
import { components } from "./_generated/api";
import type { Doc } from "./betterAuth/_generated/dataModel";
import type { Doc as AppDoc } from "./_generated/dataModel";

function isIncomingRivalRequest(
  meId: string,
  row: AppDoc<"rivals">,
  mirror: AppDoc<"rivals"> | null,
): boolean {
  const status = row.rivalStatus ?? "accepted";
  if (status !== "pending") return false;
  if (row.invitedByUserId !== undefined) {
    return row.invitedByUserId !== meId;
  }
  if (!mirror) return false;
  return row._creationTime >= mirror._creationTime;
}

async function fetchAllBetterAuthUsers(
  ctx: QueryCtx,
): Promise<Doc<"user">[]> {
  const out: Doc<"user">[] = [];
  let cursor: string | null = null;
  let isDone = false;
  while (!isDone) {
    const result = (await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "user",
        paginationOpts: { cursor, numItems: 200 },
      },
    )) as PaginationResult<Doc<"user">>;
    const page = result.page ?? [];
    out.push(...(page as Doc<"user">[]));
    isDone = result.isDone;
    cursor = result.continueCursor;
  }
  return out;
}

export const getUsers = query({
  handler: async (ctx) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const meId = String(me._id);

    const allUsers = await fetchAllBetterAuthUsers(ctx);

    // Everyone except self, then exclude active rival rows (pending/accepted).
    const users = allUsers.filter((user: Doc<"user">) => String(user._id) !== meId);
    const rivals = await ctx.db
      .query("rivals")
      .withIndex("userId", (q) => q.eq("userId", meId))
      .collect();
    return users.filter(
      (user: Doc<"user">) =>
        !rivals.some(
          (rival) =>
            String(rival.rivalUserId) === String(user._id) &&
            rival.rivalStatus !== "rejected",
        ),
    );
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
      if (existing.rivalStatus !== "rejected") {
        throw new ConvexError("This user is already on your rivals list.");
      }
      const reverseRejected = await ctx.db
        .query("rivals")
        .withIndex("by_user_rival", (q) =>
          q.eq("userId", args.rivalUserId).eq("rivalUserId", me._id),
        )
        .unique();
      await ctx.db.delete(existing._id);
      if (reverseRejected) {
        await ctx.db.delete(reverseRejected._id);
      }
    }

    const now = Date.now();
    const myRowId = await ctx.db.insert("rivals", {
      userId: me._id,
      rivalUserId: args.rivalUserId,
      nickname,
      invitedByUserId: me._id,
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
        invitedByUserId: me._id,
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

    const activeRows = rows.filter((r) => r.rivalStatus !== "rejected");

    if (activeRows.length === 0) {
      return [];
    }

    const ids = [...new Set(activeRows.map((r) => r.rivalUserId))];
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

    const legacyPending = activeRows.filter(
      (r) => r.rivalStatus === "pending" && r.invitedByUserId === undefined,
    );
    const mirrorByRowId = new Map<
      string,
      AppDoc<"rivals"> | null
    >();
    await Promise.all(
      legacyPending.map(async (row) => {
        const mirror = await ctx.db
          .query("rivals")
          .withIndex("by_user_rival", (q) =>
            q.eq("userId", row.rivalUserId).eq("rivalUserId", me._id),
          )
          .unique();
        mirrorByRowId.set(row._id, mirror);
      }),
    );

    const enriched = activeRows.map((row) => {
      const u = byId.get(row.rivalUserId);
      const mirror =
        row.rivalStatus === "pending" && row.invitedByUserId === undefined
          ? mirrorByRowId.get(row._id) ?? null
          : null;
      const incomingRequest = isIncomingRivalRequest(me._id, row, mirror);
      return {
        _id: row._id,
        rivalUserId: row.rivalUserId,
        nickname: row.nickname,
        createdAt: row.createdAt,
        rivalStatus: row.rivalStatus ?? "accepted",
        invitedByUserId: row.invitedByUserId,
        incomingRequest,
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
    
    const filteredRival =
      rival &&
      (rival.rivalStatus === undefined || rival.rivalStatus === "accepted")
        ? rival
        : null;

    if (!filteredRival) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    return filteredRival;
  },
});

export const acceptRival = mutation({
  args: {
    rivalId: v.id("rivals"),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db.get(args.rivalId);
    if (!rival || rival.userId !== me._id) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    if (rival.rivalStatus !== "pending") {
      throw new ConvexError("This request is not pending.");
    }

    const mirror = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", rival.rivalUserId).eq("rivalUserId", me._id),
      )
      .unique();

    if (!isIncomingRivalRequest(me._id, rival, mirror)) {
      throw new ConvexError("Only the invited person can accept this rival.");
    }

    if (!mirror) {
      throw new ConvexError("Connection is out of sync. Try again.");
    }

    const now = Date.now();
    await ctx.db.patch(args.rivalId, {
      rivalStatus: "accepted",
      updatedAt: now,
    });
    await ctx.db.patch(mirror._id, {
      rivalStatus: "accepted",
      updatedAt: now,
    });

    return rival;
  },
});

export const rejectRival = mutation({
  args: {
    rivalId: v.id("rivals"),
  },
  handler: async (ctx, args) => {
    const me = await authComponent.safeGetAuthUser(ctx);
    if (!me) {
      throw new ConvexError("Unauthenticated");
    }

    const rival = await ctx.db.get(args.rivalId);
    if (!rival || rival.userId !== me._id) {
      throw new ConvexError("This user is not on your rivals list.");
    }

    if (rival.rivalStatus !== "pending") {
      throw new ConvexError("This request is not pending.");
    }

    const mirror = await ctx.db
      .query("rivals")
      .withIndex("by_user_rival", (q) =>
        q.eq("userId", rival.rivalUserId).eq("rivalUserId", me._id),
      )
      .unique();

    if (!isIncomingRivalRequest(me._id, rival, mirror)) {
      throw new ConvexError("Only the invited person can decline this rival.");
    }

    if (!mirror) {
      throw new ConvexError("Connection is out of sync. Try again.");
    }

    const now = Date.now();
    await ctx.db.patch(args.rivalId, {
      rivalStatus: "rejected",
      updatedAt: now,
    });
    await ctx.db.patch(mirror._id, {
      rivalStatus: "rejected",
      updatedAt: now,
    });

    return rival;
  },
});

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

/** One-time: set `rivalStatus` on documents created before that field existed. */
export const backfillRivalStatus = internalMutation({
  handler: async (ctx) => {
    const rows = await ctx.db.query("rivals").collect();
    const now = Date.now();
    let patched = 0;
    for (const row of rows) {
      if (row.rivalStatus === undefined) {
        await ctx.db.patch(row._id, {
          rivalStatus: "accepted",
          updatedAt: now,
        });
        patched += 1;
      }
    }
    return { patched };
  },
});