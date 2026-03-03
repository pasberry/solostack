import { describe, it, expect } from "vitest";

// Import only the schema - not the server modules
import schema from "./schema";

describe("Convex Backend Schema Tests", () => {
  it("should have all required tables", () => {
    const tables = Object.keys(schema.tables);
    expect(tables).toContain("users");
    expect(tables).toContain("userSettings");
    expect(tables).toContain("leads");
    expect(tables).toContain("leadActivities");
    expect(tables).toContain("clients");
    expect(tables).toContain("projects");
    expect(tables).toContain("timeEntries");
    expect(tables).toContain("invoices");
  });

  it("should have users table", () => {
    const users = schema.tables.users;
    expect(users).toBeDefined();
  });

  it("should have clients table", () => {
    const clients = schema.tables.clients;
    expect(clients).toBeDefined();
  });

  it("should have projects table", () => {
    const projects = schema.tables.projects;
    expect(projects).toBeDefined();
  });

  it("should have timeEntries table", () => {
    const timeEntries = schema.tables.timeEntries;
    expect(timeEntries).toBeDefined();
  });

  it("should have leads table", () => {
    const leads = schema.tables.leads;
    expect(leads).toBeDefined();
  });

  it("should have invoices table", () => {
    const invoices = schema.tables.invoices;
    expect(invoices).toBeDefined();
  });

  it("should be a valid schema", () => {
    expect(schema).toBeDefined();
    expect(schema.tables).toBeDefined();
  });
});
