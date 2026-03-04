import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /invoices - List all invoices
export const getInvoices = query({
  args: { clientId: v.optional(v.id("clients")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    let query = ctx.db.query("invoices").withIndex("userId", (q) => q.eq("userId", user._id));
    
    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.userId !== user._id) return [];
      query = ctx.db.query("invoices").withIndex("clientId", (q) => q.eq("clientId", args.clientId));
    }
    
    if (args.status) {
      const invoices = await query.collect();
      return invoices.filter(inv => inv.status === args.status);
    }
    
    return query.collect();
  },
});

// GET /invoices/:id - Single invoice with items
export const getInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const invoice = await ctx.db.get(args.invoiceId);
    
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.userId !== user._id) throw new Error("Invoice not found");
    
    const client = await ctx.db.get(invoice.clientId);
    const items = await ctx.db
      .query("invoiceItems")
      .withIndex("invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .collect();
    
    return { invoice, client, items };
  },
});

// POST /invoices - Create new invoice
export const createInvoice = mutation({
  args: {
    clientId: v.id("clients"),
    dueDate: v.number(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      rate: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    
    if (!client || client.userId !== user._id) throw new Error("Client not found");
    
    // Calculate total
    const subtotal = args.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
    const invoiceId = await ctx.db.insert("invoices", {
      userId: user._id,
      clientId: args.clientId,
      invoiceNumber: `INV-${Date.now()}`,
      status: "draft",
      subtotal,
      tax: 0,
      total: subtotal,
      dueDate: args.dueDate,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create invoice items
    for (const item of args.items) {
      await ctx.db.insert("invoiceItems", {
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      });
    }
    
    return invoiceId;
  },
});

// POST /invoices/:id/send - Send invoice (mark as sent)
export const sendInvoice = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const invoice = await ctx.db.get(args.invoiceId);
    
    if (!invoice || invoice.userId !== user._id) throw new Error("Invoice not found");
    
    await ctx.db.patch(args.invoiceId, {
      status: "sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// POST /invoices/:id/pay - Mark invoice as paid
export const markPaid = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const invoice = await ctx.db.get(args.invoiceId);
    
    if (!invoice || invoice.userId !== user._id) throw new Error("Invoice not found");
    
    await ctx.db.patch(args.invoiceId, {
      status: "paid",
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// DELETE /invoices/:id - Delete invoice
export const deleteInvoice = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const invoice = await ctx.db.get(args.invoiceId);
    
    if (!invoice || invoice.userId !== user._id) throw new Error("Invoice not found");
    
    // Delete items first
    const items = await ctx.db
      .query("invoiceItems")
      .withIndex("invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .collect();
    
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    
    await ctx.db.delete(args.invoiceId);
  },
});

// GET /invoices/unpaid - Get all unpaid invoices
export const getUnpaidInvoices = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const allInvoices = await ctx.db
      .query("invoices")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return allInvoices.filter(inv => inv.status === "sent" || inv.status === "overdue");
  },
});

// GET /invoices/overdue - Get overdue invoices
export const getOverdueInvoices = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();
    const allInvoices = await ctx.db
      .query("invoices")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return allInvoices.filter(inv => 
      (inv.status === "sent" || inv.status === "overdue") && 
      inv.dueDate < now
    );
  },
});