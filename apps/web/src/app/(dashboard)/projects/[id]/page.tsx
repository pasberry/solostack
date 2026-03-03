"use client";

import { useQuery, useMutation } from "@/app/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const statusColors: Record<string, string> = {
  discovery: "bg-purple-100 text-purple-800",
  proposal: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { project, client, timeEntries } = useQuery(api.projects.getProject, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectId: projectId as any,
  }) || { project: null, client: null, timeEntries: [] };

  const updateStatus = useMutation(api.projects.updateProjectStatus);
  const updateProject = useMutation(api.projects.updateProject);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    rate: "",
    budgetHours: "",
  });

  if (!project) {
    return <div className="p-6">Loading...</div>;
  }

  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleStatusChange = async (status: string) => {
    await updateStatus({ projectId: projectId , status: status  });
  };

  const handleSave = async () => {
    await updateProject({
      projectId: projectId ,
      name: form.name || undefined,
      description: form.description || undefined,
      rate: form.rate ? Number(form.rate) : undefined,
      budgetHours: form.budgetHours ? Number(form.budgetHours) : undefined,
    });
    setEditing(false);
  };

  const startEdit = () => {
    setForm({
      name: project.name,
      description: project.description || "",
      rate: project.rate?.toString() || "",
      budgetHours: project.budgetHours?.toString() || "",
    });
    setEditing(true);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/projects" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Projects
          </Link>
          {editing ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-2xl font-bold border rounded-lg px-2 py-1"
            />
          ) : (
            <h1 className="text-2xl font-bold">{project.name}</h1>
          )}
          <p className="text-gray-600">
            {client?.name}
            {client?.company && ` - ${client.company}`}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="border px-3 py-1 rounded">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="border px-3 py-1 rounded hover:bg-gray-50">
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-2 py-1 rounded text-sm ${statusColors[project.status]}`}
          >
            <option value="discovery">Discovery</option>
            <option value="proposal">Proposal</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Billing</div>
          <div className="font-medium">
            {project.billingType === "hourly" && project.rate && `$${project.rate}/hr`}
            {project.billingType === "fixed" && "Fixed price"}
            {!project.rate && project.billingType === "hourly" && "No rate set"}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Time Tracked</div>
          <div className="font-medium">
            {totalHours}h
            {project.budgetHours && (
              <span className="text-gray-500"> / {project.budgetHours}h budget</span>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Description</h2>
        {editing ? (
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded px-3 py-2 w-full"
            rows={3}
          />
        ) : (
          <p className="text-gray-600">{project.description || "No description"}</p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Time Entries</h2>
        <Link
          href={`/projects/${projectId}/time`}
          className="text-blue-600 hover:underline"
        >
          View All →
        </Link>
      </div>

      {timeEntries.length === 0 ? (
        <div className="text-gray-500 text-center py-8 border rounded-lg">
          No time entries yet.{' '}
          <Link href={`/projects/${projectId}/time`} className="text-blue-600 hover:underline">
            Start tracking
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm">Date</th>
                <th className="text-left px-4 py-2 text-sm">Description</th>
                <th className="text-right px-4 py-2 text-sm">Duration</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.slice(0, 5).map((entry) => (
                <tr key={entry._id} className="border-t">
                  <td className="px-4 py-2 text-sm">
                    {new Date(entry.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">{entry.description || "-"}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    {entry.duration ? (entry.duration / 60).toFixed(1) + "h" : "Running..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}