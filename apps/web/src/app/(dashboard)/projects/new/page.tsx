"use client";

import { useQuery, useMutation } from "@/app/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const clients = useQuery(api.clients.getClients);
  const createProject = useMutation(api.projects.createProject);

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    description: "",
    status: "discovery",
    billingType: "hourly",
    rate: "",
    budgetHours: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.name) return;

    await createProject({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clientId: form.clientId as any,
      name: form.name,
      description: form.description || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: form.status as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billingType: form.billingType as any,
      rate: form.rate ? Number(form.rate) : undefined,
      budgetHours: form.budgetHours ? Number(form.budgetHours) : undefined,
    });

    router.push("/projects");
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client *</label>
          <select
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full"
            required
          >
            <option value="">Select a client</option>
            {clients?.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="discovery">Discovery</option>
              <option value="proposal">Proposal</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Billing Type</label>
            <select
              value={form.billingType}
              onChange={(e) => setForm({ ...form, billingType: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="e.g., 150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget (hours)</label>
            <input
              type="number"
              value={form.budgetHours}
              onChange={(e) => setForm({ ...form, budgetHours: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="e.g., 40"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Project
          </button>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}