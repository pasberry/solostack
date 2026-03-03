"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

export default function ClientsPage() {
  const clients = useQuery(api.clients.getClients);
  const [search, setSearch] = useState("");

  const filteredClients = clients?.filter((client) => {
    return (
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.company?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-600">Your active clients</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-black focus:outline-none"
        />
      </div>

      {/* Clients List */}
      {clients === undefined ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredClients?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No clients found</p>
          <Link
            href="/clients/new"
            className="mt-2 inline-block text-sm text-black underline"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients?.map((client) => (
            <Link
              key={client._id}
              href={`/clients/${client._id}`}
              className="block rounded-lg border bg-white p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{client.name}</h3>
                  {client.company && (
                    <p className="text-sm text-gray-600">{client.company}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
