import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, requireMonitorAccess } from "./auth";

export const markReviewed = mutation({
  args: { changeId: v.id("changes"), reviewed: v.boolean() },
  handler: async (ctx, args) => {
    const change = await ctx.db.get(args.changeId);
    if (!change) throw new Error("Change not found");
    await requireMonitorAccess(ctx, change.monitorId);
    await ctx.db.patch(args.changeId, { reviewed: args.reviewed });
  },
});

export const markAllReviewed = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return;

    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .collect();

    for (const monitor of monitors) {
      const changes = await ctx.db
        .query("changes")
        .withIndex("by_monitorId", (q) => q.eq("monitorId", monitor._id))
        .collect();

      for (const change of changes) {
        if (!change.reviewed) {
          await ctx.db.patch(change._id, { reviewed: true });
        }
      }
    }
  },
});

export const listByMonitor = query({
  args: {
    monitorId: v.id("monitors"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user.subject) return [];
    const limit = args.limit ?? 20;

    const changes = await ctx.db
      .query("changes")
      .withIndex("by_monitorId_detectedAt", (q) =>
        q.eq("monitorId", args.monitorId)
      )
      .order("desc")
      .take(limit);

    return Promise.all(
      changes.map(async (change) => {
        const diffUrl = await ctx.storage.getUrl(change.diffStorageId);

        // Get before/after snapshot URLs
        const beforeSnapshot = await ctx.db.get(change.beforeSnapshotId);
        const afterSnapshot = await ctx.db.get(change.afterSnapshotId);

        const beforeUrl = beforeSnapshot
          ? await ctx.storage.getUrl(beforeSnapshot.storageId)
          : null;
        const afterUrl = afterSnapshot
          ? await ctx.storage.getUrl(afterSnapshot.storageId)
          : null;

        return {
          ...change,
          diffUrl,
          beforeUrl,
          afterUrl,
          beforeTextContent: beforeSnapshot?.textContent ?? null,
          afterTextContent: afterSnapshot?.textContent ?? null,
        };
      })
    );
  },
});

export const exportByMonitor = query({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user.subject) return [];

    const changes = await ctx.db
      .query("changes")
      .withIndex("by_monitorId_detectedAt", (q) =>
        q.eq("monitorId", args.monitorId)
      )
      .order("desc")
      .take(1000);

    return changes.map((change) => ({
      detectedAt: new Date(change.detectedAt).toISOString(),
      diffPercentage: change.diffPercentage,
      notified: change.notified,
    }));
  },
});

/** Recent changes across ALL monitors for the current user */
export const recentAcrossMonitors = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    // Get all user monitors
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .collect();

    if (monitors.length === 0) return [];

    const monitorMap = new Map(monitors.map((m) => [m._id, m]));
    const limit = args.limit ?? 10;

    // Gather recent changes from all monitors, sorted by time
    const allChanges: Array<{
      _id: any;
      monitorId: any;
      monitorName: string;
      monitorUrl: string;
      diffPercentage: number;
      detectedAt: number;
      aiSummary?: string;
      reviewed?: boolean;
    }> = [];

    for (const monitor of monitors) {
      const changes = await ctx.db
        .query("changes")
        .withIndex("by_monitorId_detectedAt", (q) =>
          q.eq("monitorId", monitor._id)
        )
        .order("desc")
        .take(limit);

      for (const c of changes) {
        allChanges.push({
          _id: c._id,
          monitorId: c.monitorId,
          monitorName: monitor.name,
          monitorUrl: monitor.url,
          diffPercentage: c.diffPercentage,
          detectedAt: c.detectedAt,
          aiSummary: c.aiSummary,
          reviewed: c.reviewed,
        });
      }
    }

    // Sort all by detectedAt desc, take limit
    allChanges.sort((a, b) => b.detectedAt - a.detectedAt);
    return allChanges.slice(0, limit);
  },
});

export const get = query({
  args: { changeId: v.id("changes") },
  handler: async (ctx, args) => {
    const change = await ctx.db.get(args.changeId);
    if (!change) throw new Error("Change not found");

    await requireMonitorAccess(ctx, change.monitorId);

    const diffUrl = await ctx.storage.getUrl(change.diffStorageId);

    const beforeSnapshot = await ctx.db.get(change.beforeSnapshotId);
    const afterSnapshot = await ctx.db.get(change.afterSnapshotId);

    const beforeUrl = beforeSnapshot
      ? await ctx.storage.getUrl(beforeSnapshot.storageId)
      : null;
    const afterUrl = afterSnapshot
      ? await ctx.storage.getUrl(afterSnapshot.storageId)
      : null;

    return {
      ...change,
      diffUrl,
      beforeUrl,
      afterUrl,
      beforeTextContent: beforeSnapshot?.textContent ?? null,
      afterTextContent: afterSnapshot?.textContent ?? null,
    };
  },
});
