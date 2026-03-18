import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getUser } from "./auth";

/* ─── Internal helpers (called from actions) ─── */

export const getUserSettings = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const saveAiSummary = internalMutation({
  args: {
    changeId: v.id("changes"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.changeId, {
      aiSummary: args.summary,
    });
  },
});

/* ─── User-facing queries and mutations ─── */

export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .first();
  },
});

export const saveMySettings = mutation({
  args: {
    claudeApiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        claudeApiKey: args.claudeApiKey,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user.subject,
        claudeApiKey: args.claudeApiKey,
      });
    }
  },
});
