import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /userSettings - Get current user's settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        reminderLeadDays: 7,
        reminderProposalDays: 14,
        reminderInvoiceDays: 30,
        reminderEmailEnabled: true,
      };
    }

    return settings;
  },
});

// POST /userSettings - Create or update user settings
export const updateUserSettings = mutation({
  args: {
    reminderLeadDays: v.optional(v.number()),
    reminderProposalDays: v.optional(v.number()),
    reminderInvoiceDays: v.optional(v.number()),
    reminderEmailEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("userSettings", {
        userId: user._id,
        reminderLeadDays: args.reminderLeadDays ?? 7,
        reminderProposalDays: args.reminderProposalDays ?? 14,
        reminderInvoiceDays: args.reminderInvoiceDays ?? 30,
        reminderEmailEnabled: args.reminderEmailEnabled ?? true,
      });
    }
  },
});
