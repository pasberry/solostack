import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /clients - List all clients for current user
export const getClients = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("clients")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// GET /clients/:id - Single client with projects
export const getClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);

    if (!client || client.userId !== user._id) {
      throw new Error("Client not found");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    // Calculate revenue from paid invoices
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
    const outstandingAmount = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      client,
      projects,
      totalRevenue,
      outstandingAmount,
      invoiceCount: invoices.length,
    };
  },
});

// POST /clients - Create new client
export const createClient = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    billingRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("clients", {
      userId: user._id,
      name: args.name,
      company: args.company,
      email: args.email,
      phone: args.phone,
      address: args.address,
      billingRate: args.billingRate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// PUT /clients/:id - Update client
export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    billingRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);

    if (!client || client.userId !== user._id) {
      throw new Error("Client not found");
    }

    const { clientId, ...updates } = args;
    await ctx.db.patch(clientId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return clientId;
  },
});

// DELETE /clients/:id - Delete a client
export const deleteClient = mutation({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);

    if (!client || client.userId !== user._id) {
      throw new Error("Client not found");
    }

    // Check for associated projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    if (projects.length > 0) {
      throw new Error("Cannot delete client with existing projects");
    }

    await ctx.db.delete(args.clientId);
    return args.clientId;
  },
});

// Convert lead to client (when status = won)
export const convertToClient = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.userId !== user._id) {
      throw new Error("Lead not found");
    }

    if (lead.status !== "won") {
      throw new Error("Can only convert won leads to clients");
    }

    // Create client from lead
    const clientId = await ctx.db.insert("clients", {
      userId: lead.userId,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the conversion
    await ctx.db.insert("leadActivities", {
      leadId: args.leadId,
      action: "converted_to_client",
      note: `Converted to client: ${clientId}`,
      createdAt: Date.now(),
    });

    return clientId;
  },
});
