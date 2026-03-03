import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /leads - List all leads for current user
export const getLeads = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("leads")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// GET /leads/:id - Single lead with activities
export const getLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("leadId", (q) => q.eq("leadId", args.leadId))
      .collect();

    return { lead, activities };
  },
});

// GET /leads - List with filters
export const getLeadsByStatus = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (args.status) {
      return ctx.db
        .query("leads")
        .withIndex("userId_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status as LeadStatus)
        )
        .collect();
    }

    return ctx.db
      .query("leads")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// POST /leads - Create new lead
export const createLead = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.union(
      v.literal("referral"),
      v.literal("linkedin"),
      v.literal("website"),
      v.literal("upwork"),
      v.literal("cold_outreach"),
      v.literal("other")
    ),
    notes: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const leadId = await ctx.db.insert("leads", {
      userId: user._id,
      name: args.name,
      company: args.company,
      email: args.email,
      phone: args.phone,
      source: args.source,
      status: "new",
      notes: args.notes,
      budget: args.budget,
      timeline: args.timeline,
      score: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log creation activity
    await ctx.db.insert("leadActivities", {
      leadId,
      action: "lead_created",
      note: "Lead created",
      createdAt: Date.now(),
    });

    return leadId;
  },
});

// POST /leads/:id/status - Update lead status
export const updateStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    await ctx.db.patch(args.leadId, {
      status: args.status,
      lastContact: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("leadActivities", {
      leadId: args.leadId,
      action: "status_changed",
      note: `Status changed to ${args.status}`,
      createdAt: Date.now(),
    });

    return args.leadId;
  },
});

// POST /leads/:id/activity - Add activity log
export const addActivity = mutation({
  args: {
    leadId: v.id("leads"),
    action: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    await ctx.db.patch(args.leadId, {
      lastContact: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.insert("leadActivities", {
      leadId: args.leadId,
      action: args.action,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

// PUT /leads/:id - Update lead details
export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    const { leadId, ...updates } = args;
    await ctx.db.patch(leadId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return leadId;
  },
});

// DELETE /leads/:id - Delete a lead
export const deleteLead = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    // Delete associated activities
    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("leadId", (q) => q.eq("leadId", args.leadId))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    await ctx.db.delete(args.leadId);
    return args.leadId;
  },
});
