import { vi } from "vitest";

// Mock Convex API
vi.mock("@/convex/_generated/api", () => ({
  api: {
    projects: {
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      updateProjectStatus: vi.fn(),
      deleteProject: vi.fn(),
    },
    time: {
      getTimeEntries: vi.fn(),
      getUnbilledByClient: vi.fn(),
      startTimer: vi.fn(),
      stopTimer: vi.fn(),
      addManualEntry: vi.fn(),
      deleteTimeEntry: vi.fn(),
    },
    clients: {
      getClients: vi.fn(),
      getClient: vi.fn(),
      createClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn(),
    },
    leads: {
      getLeads: vi.fn(),
      getLead: vi.fn(),
      createLead: vi.fn(),
      updateLead: vi.fn(),
      deleteLead: vi.fn(),
    },
    settings: {
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
    },
  },
}));

// Mock ConvexClientProvider
vi.mock("@/app/ConvexClientProvider", () => ({
  useQuery: vi.fn(() => null),
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
}));

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
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
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
  };
});
