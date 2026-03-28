import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser, requireUser, requireMonitorAccess, identityEmail } from "./auth";
import { INTERVAL_MS } from "./intervals";
import { getUserPlan, countUserMonitors } from "./plans";
import { enforceRateLimit } from "./rateLimiter";

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

export const usage = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const { planId, limits } = await getUserPlan(ctx);
    const monitorCount = await countUserMonitors(ctx, user.subject);

    // Count checks (snapshots) this calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const userMonitors = await ctx.db
      .query("monitors")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .collect();
    let monthlyChecksUsed = 0;
    for (const monitor of userMonitors) {
      const snapshots = await ctx.db
        .query("snapshots")
        .withIndex("by_monitorId_capturedAt", (q) =>
          q.eq("monitorId", monitor._id).gte("capturedAt", startOfMonth)
        )
        .collect();
      monthlyChecksUsed += snapshots.length;
    }

    return {
      planId,
      planName: limits.name,
      monitorCount,
      maxMonitors: limits.maxMonitors,
      monthlyChecks: limits.monthlyChecks,
      monthlyChecksUsed,
      allowedIntervals: limits.allowedIntervals,
    };
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
      v.literal("3hour"),
      v.literal("6hour"),
      v.literal("12hour"),
      v.literal("daily"),
      v.literal("2day"),
      v.literal("weekly"),
      v.literal("2week"),
      v.literal("monthly")
    ),
    fullScreenshotStorageId: v.optional(v.id("_storage")),
    cssSelector: v.optional(v.string()),
    selectionMode: v.optional(
      v.union(v.literal("zone"), v.literal("element"))
    ),
    tags: v.optional(v.array(v.string())),
    sensitivityThreshold: v.optional(v.number()),
    compareType: v.optional(
      v.union(v.literal("all"), v.literal("visual"), v.literal("text"))
    ),
    keywords: v.optional(v.array(v.string())),
    keywordMode: v.optional(
      v.union(v.literal("added"), v.literal("deleted"), v.literal("any"))
    ),
    activeDays: v.optional(v.array(v.number())),
    delay: v.optional(v.number()),
    mobileViewport: v.optional(v.boolean()),
    blockAds: v.optional(v.boolean()),
    alertOnError: v.optional(v.boolean()),
    webhookUrl: v.optional(v.string()),
    webhookType: v.optional(
      v.union(v.literal("generic"), v.literal("slack"), v.literal("discord"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // ── Rate limit ──
    await enforceRateLimit(ctx, user.subject, "monitor:create");

    // ── Plan limit enforcement ──
    const { limits } = await getUserPlan(ctx);

    // Check monitor count
    const currentCount = await countUserMonitors(ctx, user.subject);
    if (limits.maxMonitors !== -1 && currentCount >= limits.maxMonitors) {
      throw new Error(
        `Monitor limit reached (${limits.maxMonitors} on ${limits.name} plan). Upgrade your plan to add more monitors.`
      );
    }

    // Check interval restriction
    if (!limits.allowedIntervals.includes(args.interval)) {
      throw new Error(
        `${args.interval} check frequency is not available on the ${limits.name} plan. Upgrade to Pro for faster checks.`
      );
    }

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
      sensitivityThreshold: args.sensitivityThreshold,
      compareType: args.compareType,
      keywords: args.keywords,
      keywordMode: args.keywordMode,
      activeDays: args.activeDays,
      delay: args.delay,
      mobileViewport: args.mobileViewport,
      blockAds: args.blockAds,
      alertOnError: args.alertOnError,
      webhookUrl: args.webhookUrl,
      webhookType: args.webhookType,
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
        v.literal("3hour"),
        v.literal("6hour"),
        v.literal("12hour"),
        v.literal("daily"),
        v.literal("2day"),
        v.literal("weekly"),
        v.literal("2week"),
        v.literal("monthly")
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
    cssSelector: v.optional(v.string()),
    selectionMode: v.optional(
      v.union(v.literal("zone"), v.literal("element"))
    ),
    fullScreenshotStorageId: v.optional(v.id("_storage")),
    compareType: v.optional(
      v.union(v.literal("all"), v.literal("visual"), v.literal("text"))
    ),
    keywords: v.optional(v.array(v.string())),
    keywordMode: v.optional(
      v.union(v.literal("added"), v.literal("deleted"), v.literal("any"))
    ),
    activeDays: v.optional(v.array(v.number())),
    delay: v.optional(v.number()),
    mobileViewport: v.optional(v.boolean()),
    blockAds: v.optional(v.boolean()),
    alertOnError: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { monitor } = await requireMonitorAccess(ctx, args.monitorId);

    // ── Plan limit: interval restriction ──
    if (args.interval !== undefined) {
      const { limits } = await getUserPlan(ctx);
      if (!limits.allowedIntervals.includes(args.interval)) {
        throw new Error(
          `${args.interval} check frequency is not available on the ${limits.name} plan. Upgrade to Pro for faster checks.`
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.zone !== undefined) updates.zone = args.zone;
    if (args.sensitivityThreshold !== undefined)
      updates.sensitivityThreshold = args.sensitivityThreshold;
    if (args.webhookUrl !== undefined) updates.webhookUrl = args.webhookUrl;
    if (args.webhookType !== undefined) updates.webhookType = args.webhookType;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.cssSelector !== undefined) updates.cssSelector = args.cssSelector;
    if (args.selectionMode !== undefined) updates.selectionMode = args.selectionMode;
    if (args.fullScreenshotStorageId !== undefined)
      updates.fullScreenshotStorageId = args.fullScreenshotStorageId;
    if (args.compareType !== undefined) updates.compareType = args.compareType;
    if (args.keywords !== undefined) updates.keywords = args.keywords;
    if (args.keywordMode !== undefined) updates.keywordMode = args.keywordMode;
    if (args.activeDays !== undefined) updates.activeDays = args.activeDays;
    if (args.delay !== undefined) updates.delay = args.delay;
    if (args.mobileViewport !== undefined) updates.mobileViewport = args.mobileViewport;
    if (args.blockAds !== undefined) updates.blockAds = args.blockAds;
    if (args.alertOnError !== undefined) updates.alertOnError = args.alertOnError;
    if (args.interval !== undefined) {
      updates.interval = args.interval;
      const intervalMs = INTERVAL_MS[args.interval] ?? INTERVAL_MS.daily;
      updates.nextCheckAt = Date.now() + intervalMs;
    }

    // When the monitored region changes, clear the last snapshot so the next
    // check establishes a fresh baseline instead of comparing against the old zone.
    const zoneChanged =
      args.zone !== undefined &&
      JSON.stringify(args.zone) !== JSON.stringify(monitor.zone);
    const selectorChanged =
      args.cssSelector !== undefined &&
      args.cssSelector !== monitor.cssSelector;
    const modeChanged =
      args.selectionMode !== undefined &&
      args.selectionMode !== monitor.selectionMode;

    if (zoneChanged || selectorChanged || modeChanged) {
      updates.lastSnapshotId = undefined;
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
    const { user, monitor } = await requireMonitorAccess(ctx, args.monitorId);
    await enforceRateLimit(ctx, user.subject, "monitor:checkNow");
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
