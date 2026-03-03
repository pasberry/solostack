"use client";

import { useQuery, useMutation } from "@/app/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  discovery: "bg-purple-100 text-purple-800",
  proposal: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
};

export default function ProjectsPage() {
  const [clientFilter, setClientFilter] = useState<string>("");
  const clients = useQuery(api.clients.getClients);
  const projects = useQuery(api.projects.getProjects, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientId: clientFilter ? clientFilter as any : undefined,
  });
  const deleteProject = useMutation(api.projects.deleteProject);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Delete this project?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteProject({ projectId: projectId as any });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filter by Client</label>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 w-64"
        >
          <option value="">All Clients</option>
          {clients?.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name} {client.company && `(${client.company})`}
            </option>
          ))}
        </select>
      </div>

      {projects === undefined ? (
        <div className="text-gray-500">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-500">No projects found. Create your first project!</div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const client = clients?.find((c) => c._id === project.clientId);
            return (
              <div
                key={project._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/projects/${project._id}`}
                      className="text-lg font-semibold hover:text-blue-600"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {client?.name}
                      {client?.company && ` - ${client.company}`}
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[project.status]}`}>
                      {project.status?.replace("_", " ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.billingType === "hourly" && project.rate && `$${project.rate}/hr`}
                      {project.billingType === "fixed" && "Fixed price"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/projects/${project._id}/time`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Time Entries
                  </Link>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}