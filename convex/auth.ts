import { defineAction } from "convex/server";
import { v } from "convex/values";

export default defineAction({
  args: {
    __翅_clerk_db_bridge: v.any(),
  },
  handler: async (ctx, args) => {
    // This webhook is called by Clerk to sync user data
    // The payload contains the Clerk user information
    const { data, type } = args.__翅_clerk_db_bridge;

    if (type === "user.created" || type === "user.updated") {
      // Upsert user from Clerk
      const existing = await ctx.db
        .query("users")
        .withIndex("clerkId", (q) => q.eq("clerkId", data.id))
        .first();

      if (existing) {
        // Update existing user
        await ctx.db.patch(existing._id, {
          email: data.email_addresses[0]?.email_address || "",
          name: data.first_name
            ? `${data.first_name} ${data.last_name || ""}`.trim()
            : undefined,
        });
      } else {
        // Create new user
        await ctx.db.insert("users", {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address || "",
          name: data.first_name
            ? `${data.first_name} ${data.last_name || ""}`.trim()
            : undefined,
        });
      }
    }

    if (type === "user.deleted") {
      // Handle user deletion - optionally delete all their data
      // For now, we might want to keep the data for analytics
      const user = await ctx.db
        .query("users")
        .withIndex("clerkId", (q) => q.eq("clerkId", data.id))
        .first();

      if (user) {
        // Could implement soft delete or hard delete here
        // For now, mark as deleted or remove Clerk link
        await ctx.db.patch(user._id, {
          clerkId: `deleted_${data.id}`,
        });
      }
    }

    return { success: true };
  },
});
