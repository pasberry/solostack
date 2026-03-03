import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock ConvexClientProvider BEFORE importing the component
vi.mock("@/app/ConvexClientProvider", () => ({
  useQuery: vi.fn((query: any) => {
    if (!query) return [];
    const queryStr = query.toString();
    if (queryStr.includes("getProjects") || queryStr.includes("getClients")) {
      return [{ _id: "p1", clientId: "c1", name: "Project Alpha", status: "in_progress", billingType: "hourly", rate: 150 }];
    }
    return [];
  }),
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useParams: vi.fn(() => ({})),
}));

// Mock lucide icons
vi.mock("lucide-react", () => ({
  default: {
    Plus: () => null,
    Clock: () => null,
  },
}));

// Import the actual page component
import ProjectsPage from "../src/app/(dashboard)/projects/page";

describe("Projects Page Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<ProjectsPage />);
    expect(container).toBeDefined();
  });

  it("should render the page title", () => {
    const { getAllByText } = render(<ProjectsPage />);
    // Page should have "Projects" heading (can be multiple - desktop + mobile)
    expect(getAllByText("Projects").length).toBeGreaterThan(0);
  });

  it("should render New Project button", () => {
    const { getAllByText } = render(<ProjectsPage />);
    expect(getAllByText("New Project").length).toBeGreaterThan(0);
  });
});