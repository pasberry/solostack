import { describe, it, expect } from "vitest";

describe("Schema Constants", () => {
  const leadSources = ["referral", "linkedin", "website", "upwork", "cold_outreach", "other"] as const;
  const leadStatuses = ["new", "contacted", "proposal", "negotiation", "won", "lost"] as const;

  it("should have 6 lead sources", () => expect(leadSources).toHaveLength(6));
  it("should have 6 lead statuses", () => expect(leadStatuses).toHaveLength(6));
});
