import { v } from "convex/values";
import { query } from "./_generated/server";
import { getUser, requireMonitorAccess } from "./auth";

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
    };
  },
});
