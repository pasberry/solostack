import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    clerkId: v.string(),
  }).index("email", ["email"])
   .index("clerkId", ["clerkId"]),

  // User settings for reminders
  userSettings: defineTable({
    userId: v.id("users"),
    reminderLeadDays: v.number(),
    reminderProposalDays: v.number(),
    reminderInvoiceDays: v.number(),
    reminderEmailEnabled: v.boolean(),
  }).index("userId", ["userId"]),

  // Leads - potential clients
  leads: defineTable({
    userId: v.id("users"),
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
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost")
    ),
    notes: v.optional(v.string()),
    lastContact: v.optional(v.number()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    score: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"])
   .index("userId_status", ["userId", "status"]),

  // Lead activities - audit trail
  leadActivities: defineTable({
    leadId: v.id("leads"),
    action: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("leadId", ["leadId"]),

  // Clients - converted leads or direct adds
  clients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    billingRate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"])
   .index("userId_company", ["userId", "company"]),

  // Projects - work for a client
  projects: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("discovery"),
      v.literal("proposal"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed")
    ),
    billingType: v.union(v.literal("hourly"), v.literal("fixed")),
    rate: v.optional(v.number()),
    budgetHours: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("clientId", ["clientId"])
   .index("clientId_status", ["clientId", "status"]),

  // Time entries - tracked hours
  timeEntries: defineTable({
    projectId: v.id("projects"),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    invoiceId: v.optional(v.id("invoices")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("projectId", ["projectId"])
   .index("invoiceId", ["invoiceId"]),

  // Invoices
  invoices: defineTable({
    userId: v.id("users"),
    clientId: v.id("clients"),
    projectId: v.optional(v.id("projects")),
    invoiceNumber: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    dueDate: v.number(),
    sentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"])
   .index("clientId", ["clientId"])
   .index("userId_status", ["userId", "status"]),

  // Invoice line items
  invoiceItems: defineTable({
    invoiceId: v.id("invoices"),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
  }).index("invoiceId", ["invoiceId"]),
});
