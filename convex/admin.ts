import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { PLAN_LIMITS, type PlanId } from "./plans";

/* ─── Admin auth ─── */

function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  return getAdminIds().includes(identity.subject);
}

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  if (!getAdminIds().includes(identity.subject)) {
    throw new Error("Not authorized — admin access required");
  }
  return identity;
}

/* ─── Admin queries ─── */

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allMonitors = await ctx.db.query("monitors").collect();
    const allChanges = await ctx.db.query("changes").collect();

    const userIds = new Set(allMonitors.map((m) => m.userId));

    return {
      totalUsers: userIds.size,
      totalMonitors: allMonitors.length,
      totalChanges: allChanges.length,
      activeMonitors: allMonitors.filter((m) => m.status === "active").length,
      pausedMonitors: allMonitors.filter((m) => m.status === "paused").length,
      errorMonitors: allMonitors.filter((m) => m.status === "error").length,
    };
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allMonitors = await ctx.db.query("monitors").collect();
    const allSettings = await ctx.db.query("userSettings").collect();

    // Collect unique userIds from monitors and settings
    const userMap = new Map<
      string,
      {
        userId: string;
        email: string;
        monitorCount: number;
        planOverride?: string;
        blocked?: boolean;
      }
    >();

    for (const monitor of allMonitors) {
      const existing = userMap.get(monitor.userId);
      if (existing) {
        existing.monitorCount++;
        if (monitor.email && !existing.email) existing.email = monitor.email;
      } else {
        userMap.set(monitor.userId, {
          userId: monitor.userId,
          email: monitor.email ?? "",
          monitorCount: 1,
        });
      }
    }

    // Merge settings (planOverride) and pick up users who have settings but no monitors
    for (const settings of allSettings) {
      const existing = userMap.get(settings.userId);
      if (existing) {
        existing.planOverride = settings.planOverride;
        existing.blocked = settings.blocked ?? false;
      } else {
        userMap.set(settings.userId, {
          userId: settings.userId,
          email: "",
          monitorCount: 0,
          planOverride: settings.planOverride,
          blocked: settings.blocked ?? false,
        });
      }
    }

    return Array.from(userMap.values()).sort(
      (a, b) => b.monitorCount - a.monitorCount
    );
  },
});

export const listAllMonitors = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allMonitors = await ctx.db.query("monitors").collect();

    return allMonitors.map((m) => ({
      _id: m._id,
      userId: m.userId,
      email: m.email ?? "",
      name: m.name,
      url: m.url,
      status: m.status,
      interval: m.interval,
      lastCheckedAt: m.lastCheckedAt,
      changeCount: m.changeCount,
      consecutiveErrors: m.consecutiveErrors,
      tags: m.tags,
    }));
  },
});

export const updateUserPlan = mutation({
  args: {
    userId: v.string(),
    planOverride: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("business"),
      v.literal("special"),
      v.literal("none")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const override =
      args.planOverride === "none" ? undefined : args.planOverride;

    if (settings) {
      await ctx.db.patch(settings._id, { planOverride: override });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        planOverride: override,
      });
    }
  },
});

/** Admin can block/unblock a user */
export const toggleUserBlock = mutation({
  args: {
    userId: v.string(),
    blocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (settings) {
      await ctx.db.patch(settings._id, { blocked: args.blocked });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        blocked: args.blocked,
      });
    }

    // If blocking, pause all their active monitors
    if (args.blocked) {
      const monitors = await ctx.db
        .query("monitors")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      for (const monitor of monitors) {
        if (monitor.status === "active") {
          await ctx.db.patch(monitor._id, { status: "paused" });
        }
      }
    }
  },
});

/** Admin can toggle any monitor active/paused */
export const toggleMonitor = mutation({
  args: {
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) throw new Error("Monitor not found");

    const newStatus = monitor.status === "active" ? "paused" : "active";
    await ctx.db.patch(args.monitorId, {
      status: newStatus,
      ...(newStatus === "active" ? { consecutiveErrors: 0 } : {}),
    });
  },
});
