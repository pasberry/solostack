import { QueryContext, MutationContext } from "convex/server";

/**
 * Gets the current user from the Clerk identity
 * Throws if user is not authenticated
 */
export async function getCurrentUser(
  ctx: QueryContext | MutationContext
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Gets the current user ID only (lighter weight)
 */
export async function getCurrentUserId(
  ctx: QueryContext | MutationContext
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity.subject;
}
