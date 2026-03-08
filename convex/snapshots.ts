import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireMonitorAccess } from "./auth";

export const listByMonitor = query({
  args: {
    monitorId: v.id("monitors"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireMonitorAccess(ctx, args.monitorId);
    const limit = args.limit ?? 20;

    const snapshots = await ctx.db
      .query("snapshots")
      .withIndex("by_monitorId_capturedAt", (q) =>
        q.eq("monitorId", args.monitorId)
      )
      .order("desc")
      .take(limit);

    return Promise.all(
      snapshots.map(async (snapshot) => ({
        ...snapshot,
        url: await ctx.storage.getUrl(snapshot.storageId),
        fullUrl: await ctx.storage.getUrl(snapshot.fullStorageId),
      }))
    );
  },
});

export const getCheckHistory = query({
  args: {
    monitorId: v.id("monitors"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireMonitorAccess(ctx, args.monitorId);
    const limit = args.limit ?? 50;

    // Fetch snapshots (each one = a successful check)
    const snapshots = await ctx.db
      .query("snapshots")
      .withIndex("by_monitorId_capturedAt", (q) =>
        q.eq("monitorId", args.monitorId)
      )
      .order("desc")
      .take(limit);

    // Fetch recent changes to determine which checks found differences
    const changes = await ctx.db
      .query("changes")
      .withIndex("by_monitorId_detectedAt", (q) =>
        q.eq("monitorId", args.monitorId)
      )
      .order("desc")
      .take(limit);

    // Build lookup: afterSnapshotId → change data
    const changeBySnapshot = new Map<string, { diffPercentage: number }>();
    for (const change of changes) {
      changeBySnapshot.set(change.afterSnapshotId, {
        diffPercentage: change.diffPercentage,
      });
    }

    return snapshots.map((snapshot) => {
      const change = changeBySnapshot.get(snapshot._id);
      return {
        _id: snapshot._id,
        capturedAt: snapshot.capturedAt,
        status: change ? ("changed" as const) : ("no_change" as const),
        diffPercentage: change?.diffPercentage,
      };
    });
  },
});
