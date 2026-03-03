// Mock Convex generated API
// This is a simplified mock for testing purposes

export const api = {
  projects: {
    getProjects: "getProjects" as const,
    getProject: "getProject" as const,
    createProject: "createProject" as const,
    updateProject: "updateProject" as const,
    updateProjectStatus: "updateProjectStatus" as const,
    deleteProject: "deleteProject" as const,
  },
  time: {
    getTimeEntries: "getTimeEntries" as const,
    getUnbilledByClient: "getUnbilledByClient" as const,
    startTimer: "startTimer" as const,
    stopTimer: "stopTimer" as const,
    addManualEntry: "addManualEntry" as const,
    deleteTimeEntry: "deleteTimeEntry" as const,
  },
  clients: {
    getClients: "getClients" as const,
    getClient: "getClient" as const,
    createClient: "createClient" as const,
    updateClient: "updateClient" as const,
    deleteClient: "deleteClient" as const,
  },
  leads: {
    getLeads: "getLeads" as const,
    getLead: "getLead" as const,
    createLead: "createLead" as const,
    updateLead: "updateLead" as const,
    deleteLead: "deleteLead" as const,
  },
  settings: {
    getSettings: "getSettings" as const,
    updateSettings: "updateSettings" as const,
  },
};

// Type exports for query/mutation args
export type Id<T> = string;

export const query = (name: string) => name;
export const mutation = (name: string) => name;