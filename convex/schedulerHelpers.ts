import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

const INTERVAL_MS: Record<string, number> = {
  "5min": 5 * 60 * 1000,
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

const MAX_CONSECUTIVE_ERRORS = 5;
const BATCH_SIZE = 10;

export const getDueMonitors = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_status_nextCheckAt", (q) =>
        q.eq("status", "active").lte("nextCheckAt", now)
      )
      .take(BATCH_SIZE);

    return monitors;
  },
});

export const getSnapshot = internalQuery({
  args: { snapshotId: v.id("snapshots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.snapshotId);
  },
});

export const recordSnapshot = internalMutation({
  args: {
    monitorId: v.id("monitors"),
    storageId: v.id("_storage"),
    fullStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const snapshotId = await ctx.db.insert("snapshots", {
      monitorId: args.monitorId,
      storageId: args.storageId,
      fullStorageId: args.fullStorageId,
      capturedAt: Date.now(),
    });
    return snapshotId;
  },
});

export const recordChange = internalMutation({
  args: {
    monitorId: v.id("monitors"),
    beforeSnapshotId: v.id("snapshots"),
    afterSnapshotId: v.id("snapshots"),
    diffStorageId: v.id("_storage"),
    diffPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("changes", {
      monitorId: args.monitorId,
      beforeSnapshotId: args.beforeSnapshotId,
      afterSnapshotId: args.afterSnapshotId,
      diffStorageId: args.diffStorageId,
      diffPercentage: args.diffPercentage,
      detectedAt: Date.now(),
      notified: true,
    });

    // Increment change count
    const monitor = await ctx.db.get(args.monitorId);
    if (monitor) {
      await ctx.db.patch(args.monitorId, {
        changeCount: monitor.changeCount + 1,
      });
    }
  },
});

export const updateMonitorAfterCheck = internalMutation({
  args: {
    monitorId: v.id("monitors"),
    snapshotId: v.id("snapshots"),
    changed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return;

    const intervalMs = INTERVAL_MS[monitor.interval] ?? INTERVAL_MS.daily;

    await ctx.db.patch(args.monitorId, {
      lastCheckedAt: Date.now(),
      nextCheckAt: Date.now() + intervalMs,
      lastSnapshotId: args.snapshotId,
      consecutiveErrors: 0,
    });
  },
});

export const recordMonitorError = internalMutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return;

    const errors = monitor.consecutiveErrors + 1;
    const intervalMs = INTERVAL_MS[monitor.interval] ?? INTERVAL_MS.daily;

    await ctx.db.patch(args.monitorId, {
      consecutiveErrors: errors,
      lastCheckedAt: Date.now(),
      nextCheckAt: Date.now() + intervalMs,
      status: errors >= MAX_CONSECUTIVE_ERRORS ? "error" : "active",
    });
  },
});

export const getMonitorUserEmail = internalQuery({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    // In a real app, you'd look up the user's email from Clerk or a users table.
    // For now, we return null and the email action will skip silently.
    // TODO: Implement user email lookup
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return null;
    return null;
  },
});
