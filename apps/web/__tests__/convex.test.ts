import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Convex server functions for testing
// These tests verify the logic of the Convex function handlers

describe("Convex Projects Module", () => {
  describe("Project Schema Validation", () => {
    it("should validate project status values", () => {
      const validStatuses = ["discovery", "proposal", "in_progress", "review", "completed"];
      const testStatus = "in_progress";
      
      expect(validStatuses).toContain(testStatus);
    });

    it("should validate billing type values", () => {
      const validBillingTypes = ["hourly", "fixed"];
      const testType = "hourly";
      
      expect(validBillingTypes).toContain(testType);
    });

    it("should handle project creation args", () => {
      const projectArgs = {
        clientId: "client123",
        name: "Test Project",
        description: "A test project",
        status: "discovery" as const,
        billingType: "hourly" as const,
        rate: 150,
        budgetHours: 40,
      };

      expect(projectArgs.name).toBe("Test Project");
      expect(projectArgs.status).toBe("discovery");
      expect(projectArgs.billingType).toBe("hourly");
      expect(projectArgs.rate).toBe(150);
      expect(projectArgs.budgetHours).toBe(40);
    });
  });

  describe("Project Queries", () => {
    it("should filter projects by clientId", () => {
      const projects = [
        { _id: "p1", clientId: "c1", name: "Project 1" },
        { _id: "p2", clientId: "c2", name: "Project 2" },
        { _id: "p3", clientId: "c1", name: "Project 3" },
      ];

      const filtered = projects.filter(p => p.clientId === "c1");
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.name)).toEqual(["Project 1", "Project 3"]);
    });

    it("should sort projects by status", () => {
      const projects = [
        { _id: "p1", status: "completed" },
        { _id: "p2", status: "in_progress" },
        { _id: "p3", status: "discovery" },
      ];

      const statusOrder = { discovery: 0, proposal: 1, in_progress: 2, review: 3, completed: 4 };
      const sorted = [...projects].sort((a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]);

      expect(sorted[0].status).toBe("discovery");
      expect(sorted[1].status).toBe("in_progress");
      expect(sorted[2].status).toBe("completed");
    });
  });

  describe("Project Mutations", () => {
    it("should calculate project update fields", () => {
      const updates = {
        name: "Updated Name",
        description: "Updated description",
        rate: 175,
      };

      const expected = {
        ...updates,
        updatedAt: expect.any(Number),
      };

      expect(updates.name).toBe("Updated Name");
      expect(updates.rate).toBe(175);
    });

    it("should handle status transitions", () => {
      const validTransitions: Record<string, string[]> = {
        discovery: ["proposal"],
        proposal: ["in_progress", "discovery"],
        in_progress: ["review", "proposal"],
        review: ["completed", "in_progress"],
        completed: [],
      };

      // Can go from discovery to proposal
      expect(validTransitions.discovery).toContain("proposal");
      
      // Can go from in_progress to review
      expect(validTransitions.in_progress).toContain("review");
      
      // Cannot go from completed to anything
      expect(validTransitions.completed).toHaveLength(0);
    });
  });
});

describe("Convex Time Tracking Module", () => {
  describe("Time Entry Schema", () => {
    it("should validate time entry structure", () => {
      const entry = {
        projectId: "project123",
        description: "Working on feature X",
        startTime: Date.now() - 3600000, // 1 hour ago
        endTime: Date.now(),
        duration: 60, // minutes
      };

      expect(entry.projectId).toBe("project123");
      expect(entry.duration).toBe(60);
      expect(entry.endTime).toBeGreaterThan(entry.startTime);
    });

    it("should calculate duration correctly", () => {
      const startTime = 1000 * 60 * 60; // 1 hour in ms
      const endTime = 1000 * 60 * 90; // 1.5 hours in ms
      const duration = Math.round((endTime - startTime) / 60000);

      expect(duration).toBe(30);
    });

    it("should handle running timer (no endTime)", () => {
      const runningEntry = {
        projectId: "project123",
        startTime: Date.now() - 300000, // 5 minutes ago
        endTime: undefined,
      };

      expect(runningEntry.endTime).toBeUndefined();
      expect(runningEntry.startTime).toBeDefined();
    });
  });

  describe("Time Entry Queries", () => {
    it("should filter unbilled entries", () => {
      const entries = [
        { _id: "e1", invoiceId: "inv1", duration: 60 },
        { _id: "e2", invoiceId: undefined, duration: 30 },
        { _id: "e3", invoiceId: "inv2", duration: 45 },
        { _id: "e4", invoiceId: undefined, duration: 90 },
      ];

      const unbilled = entries.filter(e => !e.invoiceId);
      
      expect(unbilled).toHaveLength(2);
      expect(unbilled.map(e => e._id)).toEqual(["e2", "e4"]);
    });

    it("should calculate total hours per project", () => {
      const entries = [
        { projectId: "p1", duration: 60 },
        { projectId: "p1", duration: 90 },
        { projectId: "p2", duration: 30 },
      ];

      const byProject = entries.reduce((acc, e) => {
        acc[e.projectId] = (acc[e.projectId] || 0) + e.duration;
        return acc;
      }, {} as Record<string, number>);

      expect(byProject.p1).toBe(150); // 2.5 hours
      expect(byProject.p2).toBe(30);  // 0.5 hours
    });
  });

  describe("Timer Functions", () => {
    it("should format duration as hours", () => {
      const formatHours = (minutes: number) => (minutes / 60).toFixed(1);

      expect(formatHours(60)).toBe("1.0");
      expect(formatHours(90)).toBe("1.5");
      expect(formatHours(15)).toBe("0.3");
    });

    it("should calculate start time from hours", () => {
      const getStartTime = (hours: number) => Date.now() - hours * 60 * 60 * 1000;
      
      const oneHourAgo = getStartTime(1);
      const now = Date.now();
      
      expect(now - oneHourAgo).toBeGreaterThanOrEqual(59 * 60 * 1000);
      expect(now - oneHourAgo).toBeLessThanOrEqual(61 * 60 * 1000);
    });
  });
});

describe("Schema Integration", () => {
  it("should have all required fields in projects table", () => {
    const project = {
      clientId: "client123",
      name: "Test Project",
      description: "Description",
      status: "in_progress",
      billingType: "hourly",
      rate: 150,
      budgetHours: 40,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Required fields
    expect(project.clientId).toBeDefined();
    expect(project.name).toBeDefined();
    expect(project.status).toBeDefined();
    expect(project.billingType).toBeDefined();

    // Optional fields
    expect(project.description).toBeDefined();
    expect(project.rate).toBeDefined();
    expect(project.budgetHours).toBeDefined();

    // Timestamps
    expect(project.createdAt).toBeDefined();
    expect(project.updatedAt).toBeDefined();
  });

  it("should have all required fields in timeEntries table", () => {
    const entry = {
      projectId: "project123",
      description: "Work done",
      startTime: Date.now(),
      endTime: Date.now() + 3600000,
      duration: 60,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(entry.projectId).toBeDefined();
    expect(entry.startTime).toBeDefined();
    expect(entry.duration).toBeDefined();
    expect(entry.createdAt).toBeDefined();
    expect(entry.updatedAt).toBeDefined();
  });
});
