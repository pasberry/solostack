"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Plus } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const clientData = useQuery(api.clients.getClient, { clientId });

  if (clientData === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!clientData) {
    return (
      <div className="text-center py-8">
        <p>Client not found</p>
        <Link href="/clients" className="text-sm underline">
          Back to Clients
        </Link>
      </div>
    );
  }

    clientData;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {client.company && (
          <p className="text-lg text-gray-600">{client.company}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold">
            {formatCurrency(outstandingAmount)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Projects</p>
          <p className="text-2xl font-bold">{projects?.length || 0}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium">Contact Information</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <Mail className="h-4 w-4" />
              {client.email}
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <Phone className="h-4 w-4" />
              {client.phone}
            </a>
          )}
          {client.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
              <MapPin className="h-4 w-4" />
              {client.address}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Projects</h3>
          <Link
            href={`/projects/new?clientId=${client._id}`}
            className="flex items-center gap-1 text-sm text-black underline"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Link>
        </div>
        {projects && projects.length > 0 ? (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="block rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {project.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No projects yet</p>
        )}
      </div>
    </div>
  );
}
