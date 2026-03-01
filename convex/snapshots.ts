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
