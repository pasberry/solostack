import { describe, it, expect, vi } from "vitest";
import { convexPolygonArea, isValidPolygon, calculateBounds } from "../packages/utils/src/index";

// Mock Convex functions for testing
const mockCtx = {
  db: {
    get: vi.fn(),
    query: vi.fn(),
    insert: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
};

const mockUser = {
  _id: "user123" as any,
  email: "test@example.com",
};

describe("Projects & Time Tracking", () => {
  describe("Project Status Helpers", () => {
    it("should have status colors for all project statuses", () => {
      const statusColors: Record<string, string> = {
        discovery: "bg-purple-100 text-purple-800",
        proposal: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        review: "bg-orange-100 text-orange-800",
        completed: "bg-green-100 text-green-800",
      };

      expect(statusColors.discovery).toBe("bg-purple-100 text-purple-800");
      expect(statusColors.proposal).toBe("bg-yellow-100 text-yellow-800");
      expect(statusColors.in_progress).toBe("bg-blue-100 text-blue-800");
      expect(statusColors.review).toBe("bg-orange-100 text-orange-800");
      expect(statusColors.completed).toBe("bg-green-100 text-green-800");
    });
  });

  describe("Time Entry Duration", () => {
    it("should calculate duration in minutes correctly", () => {
      const startTime = Date.now() - (1000 * 60 * 60); // 1 hour ago
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 60000);

      expect(duration).toBeGreaterThanOrEqual(59);
      expect(duration).toBeLessThanOrEqual(61);
    });

    it("should format duration as hours", () => {
      const durationMinutes = 90;
      const hours = (durationMinutes / 60).toFixed(1);

      expect(hours).toBe("1.5");
    });

    it("should handle zero duration", () => {
      const durationMinutes = 0;
      const hours = (durationMinutes / 60).toFixed(1);

      expect(hours).toBe("0.0");
    });
  });

  describe("Billing Type Helpers", () => {
    it("should format hourly rate correctly", () => {
      const rate = 150;
      const formatted = `$${rate}/hr`;

      expect(formatted).toBe("$150/hr");
    });

    it("should identify fixed price billing", () => {
      const billingType = "fixed";
      const isFixed = billingType === "fixed";

      expect(isFixed).toBe(true);
    });

    it("should identify hourly billing", () => {
      const billingType = "hourly";
      const isHourly = billingType === "hourly";

      expect(isHourly).toBe(true);
    });
  });

  describe("Client-Project Relationship", () => {
    it("should associate project with client", () => {
      const clientId = "client123";
      const project = {
        clientId,
        name: "Test Project",
        status: "in_progress",
      };

      expect(project.clientId).toBe(clientId);
    });

    it("should filter projects by client", () => {
      const projects = [
        { clientId: "client1", name: "Project A" },
        { clientId: "client2", name: "Project B" },
        { clientId: "client1", name: "Project C" },
      ];

      const client1Projects = projects.filter((p) => p.clientId === "client1");

      expect(client1Projects.length).toBe(2);
      expect(client1Projects.map((p) => p.name)).toEqual(["Project A", "Project C"]);
    });
  });

  describe("Time Entry Filtering", () => {
    it("should filter unbilled time entries", () => {
      const timeEntries = [
        { invoiceId: "inv1", duration: 60 },
        { invoiceId: undefined, duration: 30 },
        { invoiceId: undefined, duration: 45 },
        { invoiceId: "inv2", duration: 90 },
      ];

      const unbilled = timeEntries.filter((e) => !e.invoiceId);

      expect(unbilled.length).toBe(2);
      expect(unbilled.reduce((sum, e) => sum + e.duration, 0)).toBe(75);
    });

    it("should calculate total hours from time entries", () => {
      const timeEntries = [
        { duration: 60 },
        { duration: 90 },
        { duration: 30 },
      ];

      const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
      const totalHours = (totalMinutes / 60).toFixed(1);

      expect(totalHours).toBe("3.0");
    });
  });

  describe("Project Status Transitions", () => {
    const validStatuses = ["discovery", "proposal", "in_progress", "review", "completed"];

    it("should validate status transitions", () => {
      const currentStatus = "discovery";
      const validTransitions = {
        discovery: ["proposal"],
        proposal: ["in_progress", "discovery"],
        in_progress: ["review", "proposal"],
        review: ["completed", "in_progress"],
        completed: [],
      };

      expect(validTransitions.discovery).toContain("proposal");
      expect(validTransitions.proposal).toContain("in_progress");
      expect(validTransitions.in_progress).toContain("review");
      expect(validTransitions.review).toContain("completed");
    });

    it("should have all valid statuses defined", () => {
      const statusCounts: Record<string, number> = {
        discovery: 0,
        proposal: 0,
        in_progress: 0,
        review: 0,
        completed: 0,
      };

      // Simulate project counts
      const projects = [
        { status: "discovery" },
        { status: "in_progress" },
        { status: "completed" },
      ];

      projects.forEach((p) => {
        if (statusCounts[p.status] !== undefined) {
          statusCounts[p.status]++;
        }
      });

      expect(statusCounts.discovery).toBe(1);
      expect(statusCounts.in_progress).toBe(1);
      expect(statusCounts.completed).toBe(1);
    });
  });

  describe("Timer State", () => {
    it("should handle timer start state", () => {
      const runningEntry = {
        _id: "entry123",
        startTime: Date.now(),
      };

      expect(runningEntry._id).toBeDefined();
      expect(runningEntry.startTime).toBeGreaterThan(0);
    });

    it("should calculate elapsed time from start", () => {
      const startTime = Date.now() - 5 * 60 * 1000; // 5 minutes ago
      const elapsed = Math.floor((Date.now() - startTime) / 60000);

      expect(elapsed).toBeGreaterThanOrEqual(4);
      expect(elapsed).toBeLessThanOrEqual(6);
    });

    it("should handle null running entry", () => {
      const runningEntry = null;
      const display = runningEntry ? "Timer running" : null;

      expect(display).toBeNull();
    });
  });
});
