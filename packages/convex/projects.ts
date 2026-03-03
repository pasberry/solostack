import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./authUtils";

// GET /projects - List all projects for current user's clients
export const getProjects = query({
  args: { clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.userId !== user._id) {
        throw new Error("Client not found");
      }
      return ctx.db
        .query("projects")
        .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
        .collect();
    }
    
    // Get all clients for user, then all projects for those clients
    const clients = await ctx.db
      .query("clients")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    const clientIds = clients.map(c => c._id);
    const allProjects = await Promise.all(
      clientIds.map(cid => 
        ctx.db.query("projects")
          .withIndex("clientId", (q) => q.eq("clientId", cid))
          .collect()
      )
    );
    
    return allProjects.flat();
  },
});

// GET /projects/:id - Single project with time entries
export const getProject = query({
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
    
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    return { project, client, timeEntries };
  },
});

// POST /projects - Create new project
export const createProject = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("discovery"),
      v.literal("proposal"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed")
    )),
    billingType: v.optional(v.union(v.literal("hourly"), v.literal("fixed"))),
    rate: v.optional(v.number()),
    budgetHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(args.clientId);
    
    if (!client || client.userId !== user._id) {
      throw new Error("Client not found");
    }
    
    return await ctx.db.insert("projects", {
      clientId: args.clientId,
      name: args.name,
      description: args.description,
      status: args.status || "discovery",
      billingType: args.billingType || "hourly",
      rate: args.rate,
      budgetHours: args.budgetHours,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// POST /projects/:id/status - Update project status
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("discovery"),
      v.literal("proposal"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed")
    ),
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
    
    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// POST /projects/:id - Update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    rate: v.optional(v.number()),
    budgetHours: v.optional(v.number()),
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
    
    const { projectId, ...updates } = args;
    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// DELETE /projects/:id - Delete project
export const deleteProject = mutation({
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
    
    await ctx.db.delete(args.projectId);
  },
});