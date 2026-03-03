import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /timeEntries - Get time entries for a project
export const getTimeEntries = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const client = await ctx.db.get(project.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Project not found");
    }
    
    return ctx.db
      .query("timeEntries")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// GET /timeEntries/unbilled - Get unbilled time entries for a client
export const getUnbilledByClient = query({
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
    
    const projectIds = projects.map(p => p._id);
    
    const allEntries = await Promise.all(
      projectIds.map(pid =>
        ctx.db
          .query("timeEntries")
          .withIndex("projectId", (q) => q.eq("projectId", pid))
          .collect()
      )
    );
    
    const entries = allEntries.flat();
    
    // Filter unbilled entries
    return entries.filter(e => !e.invoiceId);
  },
});

// POST /timeEntries/start - Start timer
export const startTimer = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const client = await ctx.db.get(project.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Project not found");
    }
    
    return await ctx.db.insert("timeEntries", {
      projectId: args.projectId,
      description: args.description,
      startTime: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// POST /timeEntries/:id/stop - Stop timer
export const stopTimer = mutation({
  args: { entryId: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const entry = await ctx.db.get(args.entryId);
    
    if (!entry) {
      throw new Error("Time entry not found");
    }
    
    const project = await ctx.db.get(entry.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const client = await ctx.db.get(project.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Project not found");
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - entry.startTime) / 60000); // minutes
    
    await ctx.db.patch(args.entryId, {
      endTime,
      duration,
      updatedAt: Date.now(),
    });
    
    return duration;
  },
});

// POST /timeEntries - Add manual time entry
export const addManualEntry = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const client = await ctx.db.get(project.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Project not found");
    }
    
    const duration = Math.round((args.endTime - args.startTime) / 60000);
    
    return await ctx.db.insert("timeEntries", {
      projectId: args.projectId,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      duration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// DELETE /timeEntries/:id - Delete time entry
export const deleteTimeEntry = mutation({
  args: { entryId: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const entry = await ctx.db.get(args.entryId);
    
    if (!entry) {
      throw new Error("Time entry not found");
    }
    
    const project = await ctx.db.get(entry.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const client = await ctx.db.get(project.clientId);
    if (!client || client.userId !== user._id) {
      throw new Error("Project not found");
    }
    
    await ctx.db.delete(args.entryId);
  },
});