import { vi } from "vitest";

// Mock Convex API
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
      getClient: "getClient",
      createClient: "createClient",
      updateClient: "updateClient",
      deleteClient: "deleteClient",
    },
    leads: {
      getLeads: "getLeads",
      getLead: "getLead",
      createLead: "createLead",
      updateLead: "updateLead",
      deleteLead: "deleteLead",
      updateLeadStatus: "updateLeadStatus",
    },
    settings: {
      getSettings: "getSettings",
      updateSettings: "updateSettings",
    },
  },
}));

// Mock ConvexClientProvider (for projects page)
vi.mock("@/app/ConvexClientProvider", () => {
  const mockData: Record<string, any[]> = {
    getProjects: [{ _id: "p1", clientId: "c1", name: "Project Alpha", status: "in_progress", billingType: "hourly", rate: 150 }],
    getClients: [{ _id: "c1", name: "Acme Corp", company: "Acme", email: "test@acme.com" }],
    getLeads: [{ _id: "l1", name: "Lead One", status: "new", source: "referral" }],
    getSettings: [{ _id: "s1", reminderDays: 3, emailNotifications: true }],
  };
  return {
    useQuery: vi.fn((query: any) => {
      const key = query?.toString() || "";
      return mockData[key] || [];
    }),
    useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  };
});

// Mock convex/react (for clients page)
vi.mock("convex/react", () => {
  const mockData: Record<string, any[]> = {
    getProjects: [{ _id: "p1", clientId: "c1", name: "Project Alpha", status: "in_progress", billingType: "hourly", rate: 150 }],
    getClients: [{ _id: "c1", name: "Acme Corp", company: "Acme", email: "test@acme.com" }],
    getLeads: [{ _id: "l1", name: "Lead One", status: "new", source: "referral" }],
    getSettings: [{ _id: "s1", reminderDays: 3, emailNotifications: true }],
  };
  return {
    useQuery: vi.fn((query: any) => {
      const key = query?.toString() || "";
      return mockData[key] || [];
    }),
    useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  };
});

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(() => Promise.resolve("user_123")),
  currentUser: vi.fn(() => Promise.resolve({ id: "user_123", email: "test@example.com" })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  useUser: vi.fn(() => ({ user: { id: "user_123" } })),
  useAuth: vi.fn(() => ({ userId: "user_123", isLoaded: true, isSignedIn: true })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  useParams: vi.fn(() => ({})),
  usePathname: vi.fn(() => "/"),
  redirect: vi.fn(),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  const MockIcon = (props: Record<string, unknown>) => null;
  return {
    LayoutDashboard: MockIcon,
    Users: MockIcon,
    UserPlus: MockIcon,
    Clock: MockIcon,
    FileText: MockIcon,
    Settings: MockIcon,
    Briefcase: MockIcon,
    Plus: MockIcon,
    ArrowLeft: MockIcon,
    Trash2: MockIcon,
    Edit: MockIcon,
    Check: MockIcon,
    X: MockIcon,
    Search: MockIcon,
    Filter: MockIcon,
  };
});
