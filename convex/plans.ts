import { QueryCtx, MutationCtx } from "./_generated/server";

/* ─── Plan definitions ─── */

export type PlanId = "free" | "pro" | "business";

export interface PlanLimits {
  name: string;
  maxMonitors: number; // -1 = unlimited
  monthlyChecks: number;
  /** Minimum allowed interval key — intervals faster than this are gated */
  minInterval: string;
  /** All interval keys this plan can use */
  allowedIntervals: string[];
}

const FREE_INTERVALS = [
  "daily",
  "2day",
  "weekly",
  "2week",
  "monthly",
];

const ALL_INTERVALS = [
  "5min",
  "15min",
  "30min",
  "hourly",
  "3hour",
  "6hour",
  "12hour",
  "daily",
  "2day",
  "weekly",
  "2week",
  "monthly",
];

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    name: "Free",
    maxMonitors: 5,
    monthlyChecks: 500,
    minInterval: "daily",
    allowedIntervals: FREE_INTERVALS,
  },
  pro: {
    name: "Pro",
    maxMonitors: 50,
    monthlyChecks: 10_000,
    minInterval: "5min",
    allowedIntervals: ALL_INTERVALS,
  },
  business: {
    name: "Business",
    maxMonitors: -1, // unlimited
    monthlyChecks: 50_000,
    minInterval: "5min",
    allowedIntervals: ALL_INTERVALS,
  },
};

/**
 * Determine the user's plan from their Clerk JWT identity.
 *
 * When Clerk billing is configured, the JWT will include a `plan` or
 * `subscription` custom claim. Until then, everyone defaults to "free".
 */
export function getPlanFromIdentity(
  identity: { subject: string } & Record<string, unknown>
): PlanId {
  // Check for Clerk custom claims (set via billing or metadata)
  const plan = identity["plan"] ?? identity["subscription"] ?? identity["org_plan"];
  if (plan === "pro") return "pro";
  if (plan === "business") return "business";
  return "free";
}

/**
 * Get the current user's plan limits.
 */
export async function getUserPlan(
  ctx: QueryCtx | MutationCtx
): Promise<{ planId: PlanId; limits: PlanLimits }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { planId: "free", limits: PLAN_LIMITS.free };
  }
  const planId = getPlanFromIdentity(identity as any);
  return { planId, limits: PLAN_LIMITS[planId] };
}

/**
 * Count how many monitors a user currently has.
 */
export async function countUserMonitors(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<number> {
  const monitors = await ctx.db
    .query("monitors")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  return monitors.length;
}
