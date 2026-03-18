import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { INTERVAL_MS } from "./intervals";

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

export const getMonitor = internalQuery({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.monitorId);
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
    textContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const snapshotId = await ctx.db.insert("snapshots", {
      monitorId: args.monitorId,
      storageId: args.storageId,
      fullStorageId: args.fullStorageId,
      capturedAt: Date.now(),
      textContent: args.textContent,
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
    textDiff: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const changeId = await ctx.db.insert("changes", {
      monitorId: args.monitorId,
      beforeSnapshotId: args.beforeSnapshotId,
      afterSnapshotId: args.afterSnapshotId,
      diffStorageId: args.diffStorageId,
      diffPercentage: args.diffPercentage,
      detectedAt: Date.now(),
      notified: true,
      textDiff: args.textDiff,
    });

    // Increment change count
    const monitor = await ctx.db.get(args.monitorId);
    if (monitor) {
      await ctx.db.patch(args.monitorId, {
        changeCount: monitor.changeCount + 1,
      });

      // Get before/after text content for AI summary
      const beforeSnapshot = await ctx.db.get(args.beforeSnapshotId);
      const afterSnapshot = await ctx.db.get(args.afterSnapshotId);

      // Schedule AI summary generation (async, non-blocking)
      await ctx.scheduler.runAfter(
        0,
        internal.aiActions.generateChangeSummary,
        {
          changeId,
          monitorId: args.monitorId,
          monitorName: monitor.name,
          monitorUrl: monitor.url,
          diffPercentage: args.diffPercentage,
          textDiff: args.textDiff,
          beforeTextContent: beforeSnapshot?.textContent,
          afterTextContent: afterSnapshot?.textContent,
        }
      );
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
      isChecking: false,
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
      isChecking: false,
    });
  },
});

export const rescheduleMonitor = internalMutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return;

    const intervalMs = INTERVAL_MS[monitor.interval] ?? INTERVAL_MS.daily;

    await ctx.db.patch(args.monitorId, {
      lastCheckedAt: Date.now(),
      nextCheckAt: Date.now() + intervalMs,
      isChecking: false,
    });
  },
});

export const getMonitorUserEmail = internalQuery({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return null;
    return monitor.email ?? null;
  },
});
