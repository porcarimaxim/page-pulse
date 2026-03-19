import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { checkRateLimit } from "./rateLimiter";

/**
 * Internal mutation to check and record a rate-limited action.
 * Called from actions (which can't access the DB directly).
 */
export const check = internalMutation({
  args: {
    userId: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await checkRateLimit(ctx, args.userId, args.action);
    if (result.allowed === false) {
      const seconds = Math.ceil(result.retryAfterMs / 1000);
      throw new Error(
        `Rate limit exceeded. Please try again in ${seconds} second${seconds !== 1 ? "s" : ""}.`
      );
    }
  },
});

/**
 * Public mutation for client-side pre-checks (e.g. before starting
 * an expensive screenshot action, the client can check if it'll be
 * rate-limited and show a message instead of waiting for the action to fail).
 */
export const preCheck = mutation({
  args: {
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const result = await checkRateLimit(ctx, identity.subject, args.action);
    return result;
  },
});
