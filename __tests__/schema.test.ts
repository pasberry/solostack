import { describe, it, expect } from "vitest";

describe("Schema Constants", () => {
  const leadSources = ["referral", "linkedin", "website", "upwork", "cold_outreach", "other"] as const;
  const leadStatuses = ["new", "contacted", "proposal", "negotiation", "won", "lost"] as const;
  const projectStatuses = ["discovery", "proposal", "in_progress", "review", "completed"] as const;
  const billingTypes = ["hourly", "fixed"] as const;
  const invoiceStatuses = ["draft", "sent", "paid", "overdue"] as const;

  it("should have 6 lead sources", () => expect(leadSources).toHaveLength(6));
  it("should have 6 lead statuses", () => expect(leadStatuses).toHaveLength(6));
  it("should have 5 project statuses", () => expect(projectStatuses).toHaveLength(5));
  it("should have 2 billing types", () => expect(billingTypes).toHaveLength(2));
  it("should have 4 invoice statuses", () => expect(invoiceStatuses).toHaveLength(4));
});
