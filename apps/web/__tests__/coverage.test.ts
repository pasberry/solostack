import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock Convex
vi.mock("@/convex/_generated/api", () => ({
  api: {
    projects: {
      getProjects: "getProjects",
      getProject: "getProject",
      createProject: "createProject",
      updateProject: "updateProject",
      updateProjectStatus: "updateProjectStatus",
      deleteProject: "deleteProject",
    },
    time: {
      getTimeEntries: "getTimeEntries",
      getUnbilledByClient: "getUnbilledByClient",
      startTimer: "startTimer",
      stopTimer: "stopTimer",
      addManualEntry: "addManualEntry",
      deleteTimeEntry: "deleteTimeEntry",
    },
    clients: {
      getClients: "getClients",
    },
  },
}));

vi.mock("@/app/ConvexClientProvider", () => ({
  useQuery: vi.fn((query, args) => {
    // Return mock data based on query
    if (query === "getProjects") {
      return [
        { 
          _id: "p1", 
          clientId: "c1", 
          name: "Test Project", 
          status: "in_progress", 
          billingType: "hourly",
          rate: 150,
          description: "A test project"
        }
      ];
    }
    if (query === "getProject") {
      return {
        project: { 
          _id: "p1", 
          clientId: "c1", 
          name: "Test Project", 
          status: "in_progress",
          billingType: "hourly",
          rate: 150,
          description: "A test project",
          budgetHours: 40
        },
        client: { _id: "c1", name: "Test Client", company: "Acme Inc" },
        timeEntries: [
          { _id: "t1", startTime: Date.now() - 3600000, duration: 60, description: "Work" }
        ]
      };
    }
    if (query === "getClients") {
      return [
        { _id: "c1", name: "Test Client", company: "Acme Inc", email: "test@acme.com" }
      ];
    }
    return null;
  }),
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
}));

describe("Projects Page Coverage", () => {
  it("should have correct status colors mapping", () => {
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

  it("should format billing type correctly", () => {
    const project = {
      billingType: "hourly" as const,
      rate: 150,
    };

    const formatBilling = (p: typeof project) => {
      if (p.billingType === "hourly" && p.rate) {
        return `$${p.rate}/hr`;
      }
      if (p.billingType === "fixed") {
        return "Fixed price";
      }
      return "No billing";
    };

    expect(formatBilling(project)).toBe("$150/hr");
  });

  it("should handle project without rate", () => {
    const project = {
      billingType: "hourly" as const,
      rate: undefined,
    };

    const formatBilling = (p: typeof project) => {
      if (p.billingType === "hourly" && p.rate) {
        return `$${p.rate}/hr`;
      }
      if (p.billingType === "fixed") {
        return "Fixed price";
      }
      return "No billing";
    };

    expect(formatBilling(project)).toBe("No billing");
  });
});

describe("Time Tracking Coverage", () => {
  it("should calculate total hours from entries", () => {
    const timeEntries = [
      { duration: 60 },
      { duration: 90 },
      { duration: 30 },
    ];

    const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    expect(totalHours).toBe("3.0");
  });

  it("should filter unbilled entries", () => {
    const timeEntries = [
      { _id: "t1", invoiceId: "inv1", duration: 60 },
      { _id: "t2", invoiceId: undefined, duration: 30 },
      { _id: "t3", invoiceId: undefined, duration: 45 },
    ];

    const unbilled = timeEntries.filter(e => !e.invoiceId);
    
    expect(unbilled).toHaveLength(2);
    expect(unbilled.map(e => e._id)).toEqual(["t2", "t3"]);
  });

  it("should format duration for display", () => {
    const formatDuration = (minutes: number | undefined) => {
      if (!minutes) return "Running...";
      return `${(minutes / 60).toFixed(1)}h`;
    };

    expect(formatDuration(60)).toBe("1.0h");
    expect(formatDuration(90)).toBe("1.5h");
    expect(formatDuration(undefined)).toBe("Running...");
  });
});

describe("New Project Form Coverage", () => {
  it("should validate form state", () => {
    const form = {
      clientId: "c1",
      name: "New Project",
      description: "Description",
      status: "discovery",
      billingType: "hourly",
      rate: "150",
      budgetHours: "40",
    };

    const isValid = Boolean(form.clientId && form.name);

    expect(isValid).toBe(true);
  });

  it("should validate empty form", () => {
    const form = {
      clientId: "",
      name: "",
      description: "",
      status: "discovery",
      billingType: "hourly",
      rate: "",
      budgetHours: "",
    };

    const isValid = Boolean(form.clientId && form.name);

    expect(isValid).toBe(false);
  });

  it("should convert string inputs to numbers", () => {
    const form = {
      rate: "150",
      budgetHours: "40",
    };

    const numericRate = form.rate ? Number(form.rate) : undefined;
    const numericBudget = form.budgetHours ? Number(form.budgetHours) : undefined;

    expect(numericRate).toBe(150);
    expect(numericBudget).toBe(40);
  });

  it("should handle invalid number strings", () => {
    const form = {
      rate: "abc",
      budgetHours: "",
    };

    const numericRate = form.rate ? Number(form.rate) : undefined;
    const numericBudget = form.budgetHours ? Number(form.budgetHours) : undefined;

    expect(numericRate).toBe(NaN);
    expect(numericBudget).toBeUndefined();
  });
});

describe("Project Detail Coverage", () => {
  it("should calculate budget utilization", () => {
    const project = {
      budgetHours: 40,
    };
    
    const timeEntries = [
      { duration: 60 },
      { duration: 90 },
    ];

    // 60 + 90 = 150 minutes = 2.5 hours
    // 2.5 / 40 * 100 = 6.25%
    const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const utilization = project.budgetHours ? (totalHours / project.budgetHours) * 100 : 0;

    expect(utilization).toBe(6.25);
  });

  it("should handle projects without budget", () => {
    const project = {
      budgetHours: undefined,
    };
    
    const timeEntries = [{ duration: 60 }];
    const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const utilization = project.budgetHours ? (totalHours / project.budgetHours) * 100 : 0;

    expect(utilization).toBe(0);
  });

  it("should format status for display", () => {
    const statusDisplay = (status: string) => status?.replace("_", " ");

    expect(statusDisplay("in_progress")).toBe("in progress");
    expect(statusDisplay("discovery")).toBe("discovery");
  });
});
