import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

type ClerkIdentity = NonNullable<
  Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>
>;

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function getOptionalString(identity: ClerkIdentity, key: string): string | undefined {
  const value = (identity as Record<string, unknown>)[key];
  return hasString(value) ? value : undefined;
}

export function identityName(identity: ClerkIdentity): string {
  const name = getOptionalString(identity, "name");
  if (name) return name;

  const email = getOptionalString(identity, "email");
  if (email) return email;

  return "Unknown";
}

export function identityEmail(identity: ClerkIdentity): string {
  return getOptionalString(identity, "email") ?? "";
}

export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity;
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function getIdentity(ctx: ActionCtx) {
  // Retry once after a short delay to handle Clerk→Convex token sync lag
  let identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    await new Promise((r) => setTimeout(r, 500));
    identity = await ctx.auth.getUserIdentity();
  }
  if (!identity) {
    throw new Error("Not authenticated. Please try again.");
  }
  return identity;
}

export async function requireMonitorAccess(
  ctx: QueryCtx | MutationCtx,
  monitorId: Id<"monitors">
) {
  const user = await requireUser(ctx);
  const monitor = await ctx.db.get(monitorId);
  if (!monitor) {
    throw new Error("Monitor not found");
  }
  if (monitor.userId !== user.subject) {
    throw new Error("Not authorized");
  }
  return { user, monitor };
}
