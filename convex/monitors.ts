import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser, requireUser, requireMonitorAccess, identityEmail } from "./auth";

const INTERVAL_MS: Record<string, number> = {
  "5min": 5 * 60 * 1000,
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .collect();

    return Promise.all(
      monitors.map(async (monitor) => {
        const screenshotUrl = monitor.fullScreenshotStorageId
          ? await ctx.storage.getUrl(monitor.fullScreenshotStorageId)
          : null;
        return { ...monitor, screenshotUrl };
      })
    );
  },
});

export const get = query({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user.subject) return null;
    const screenshotUrl = monitor.fullScreenshotStorageId
      ? await ctx.storage.getUrl(monitor.fullScreenshotStorageId)
      : null;
    return { ...monitor, screenshotUrl };
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    zone: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
    interval: v.union(
      v.literal("5min"),
      v.literal("15min"),
      v.literal("30min"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    fullScreenshotStorageId: v.optional(v.id("_storage")),
    cssSelector: v.optional(v.string()),
    selectionMode: v.optional(
      v.union(v.literal("zone"), v.literal("element"))
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const intervalMs = INTERVAL_MS[args.interval] ?? INTERVAL_MS.daily;

    const monitorId = await ctx.db.insert("monitors", {
      userId: user.subject,
      url: args.url,
      name: args.name,
      email: identityEmail(user),
      zone: args.zone,
      cssSelector: args.cssSelector,
      selectionMode: args.selectionMode ?? "zone",
      interval: args.interval,
      status: "active",
      nextCheckAt: now + intervalMs,
      changeCount: 0,
      consecutiveErrors: 0,
      fullScreenshotStorageId: args.fullScreenshotStorageId,
      tags: args.tags,
    });

    return monitorId;
  },
});

export const update = mutation({
  args: {
    monitorId: v.id("monitors"),
    name: v.optional(v.string()),
    interval: v.optional(
      v.union(
        v.literal("5min"),
        v.literal("15min"),
        v.literal("30min"),
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly")
      )
    ),
    zone: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      })
    ),
    sensitivityThreshold: v.optional(v.number()),
    webhookUrl: v.optional(v.string()),
    webhookType: v.optional(
      v.union(
        v.literal("generic"),
        v.literal("slack"),
        v.literal("discord")
      )
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireMonitorAccess(ctx, args.monitorId);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.zone !== undefined) updates.zone = args.zone;
    if (args.sensitivityThreshold !== undefined)
      updates.sensitivityThreshold = args.sensitivityThreshold;
    if (args.webhookUrl !== undefined) updates.webhookUrl = args.webhookUrl;
    if (args.webhookType !== undefined) updates.webhookType = args.webhookType;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.interval !== undefined) {
      updates.interval = args.interval;
      const intervalMs = INTERVAL_MS[args.interval] ?? INTERVAL_MS.daily;
      updates.nextCheckAt = Date.now() + intervalMs;
    }

    await ctx.db.patch(args.monitorId, updates);
  },
});

export const pause = mutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    await requireMonitorAccess(ctx, args.monitorId);
    await ctx.db.patch(args.monitorId, { status: "paused" });
  },
});

export const resume = mutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const { monitor } = await requireMonitorAccess(ctx, args.monitorId);
    const intervalMs = INTERVAL_MS[monitor.interval] ?? INTERVAL_MS.daily;
    await ctx.db.patch(args.monitorId, {
      status: "active",
      nextCheckAt: Date.now() + intervalMs,
      consecutiveErrors: 0,
    });
  },
});

export const checkNow = mutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const { monitor } = await requireMonitorAccess(ctx, args.monitorId);
    // Recover from paused or error state
    if (monitor.status !== "active") {
      const intervalMs = INTERVAL_MS[monitor.interval] ?? INTERVAL_MS.daily;
      await ctx.db.patch(args.monitorId, {
        status: "active",
        nextCheckAt: Date.now() + intervalMs,
        consecutiveErrors: 0,
      });
    }
    // Mark as checking — reactive frontend will show "In progress" row
    await ctx.db.patch(args.monitorId, { isChecking: true });
    await ctx.scheduler.runAfter(
      0,
      internal.scheduler.processOneMonitor,
      { monitorId: args.monitorId }
    );
  },
});

export const remove = mutation({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    await requireMonitorAccess(ctx, args.monitorId);

    // Delete associated snapshots
    const snapshots = await ctx.db
      .query("snapshots")
      .withIndex("by_monitorId", (q) => q.eq("monitorId", args.monitorId))
      .collect();
    for (const snapshot of snapshots) {
      await ctx.storage.delete(snapshot.storageId);
      await ctx.storage.delete(snapshot.fullStorageId);
      await ctx.db.delete(snapshot._id);
    }

    // Delete associated changes
    const changes = await ctx.db
      .query("changes")
      .withIndex("by_monitorId", (q) => q.eq("monitorId", args.monitorId))
      .collect();
    for (const change of changes) {
      await ctx.storage.delete(change.diffStorageId);
      await ctx.db.delete(change._id);
    }

    // Delete the full screenshot
    const monitor = await ctx.db.get(args.monitorId);
    if (monitor?.fullScreenshotStorageId) {
      await ctx.storage.delete(monitor.fullScreenshotStorageId);
    }

    await ctx.db.delete(args.monitorId);
  },
});
