import { MutationCtx } from "./_generated/server";
import { getUserPlan } from "./plans";

/* ─── Rate limit definitions ─── */

export interface RateLimitConfig {
  /** Max number of actions allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Rate limits for different actions.
 *
 * Screenshot-related actions are the most expensive (each one calls
 * an external screenshot API that costs money), so they have the
 * tightest limits. Mutations like create/checkNow are cheaper but
 * still need guardrails against rapid-fire abuse.
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  /** Taking a screenshot during monitor setup */
  "screenshot:capture": { maxRequests: 10, windowMs: 10 * 60 * 1000 },
  /** Resolving an element from a click (2 API calls each) */
  "screenshot:resolveElement": { maxRequests: 20, windowMs: 10 * 60 * 1000 },
  /** Loading element map for picker (1 API call) */
  "screenshot:elementMap": { maxRequests: 10, windowMs: 10 * 60 * 1000 },
  /** Creating a new monitor */
  "monitor:create": { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  /** Manual "Check Now" button */
  "monitor:checkNow": { maxRequests: 10, windowMs: 10 * 60 * 1000 },
};

/**
 * Check whether an action is allowed under the rate limit, and if so,
 * record it. Operates inside a Convex mutation for transactional safety.
 *
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  userId: string,
  action: string
): Promise<{ allowed: true } | { allowed: false; retryAfterMs: number }> {
  const config = RATE_LIMITS[action];
  if (!config) {
    // No rate limit defined for this action — allow
    return { allowed: true };
  }

  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get existing record
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing) {
    // First request ever — create record and allow
    await ctx.db.insert("rateLimits", {
      key,
      timestamps: [now],
    });
    return { allowed: true };
  }

  // Prune old timestamps outside the window
  const recentTimestamps = existing.timestamps.filter((t) => t > windowStart);

  if (recentTimestamps.length >= config.maxRequests) {
    // Rate limited — calculate when the oldest request will expire
    const oldestInWindow = recentTimestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(1000, retryAfterMs) };
  }

  // Allowed — add this request
  recentTimestamps.push(now);
  await ctx.db.patch(existing._id, { timestamps: recentTimestamps });
  return { allowed: true };
}

/**
 * Convenience: throws an Error if rate limited.
 * Automatically skips rate limiting for users on the "special" plan.
 */
export async function enforceRateLimit(
  ctx: MutationCtx,
  userId: string,
  action: string
): Promise<void> {
  // Check if user's plan skips rate limits
  const { limits } = await getUserPlan(ctx);
  if (limits.skipRateLimit) return;

  const result = await checkRateLimit(ctx, userId, action);
  if (result.allowed === false) {
    const seconds = Math.ceil(result.retryAfterMs / 1000);
    throw new Error(
      `Rate limit exceeded. Please try again in ${seconds} second${seconds !== 1 ? "s" : ""}.`
    );
  }
}
