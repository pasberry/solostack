"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const sourceLabels: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  website: "Website",
  upwork: "Upwork",
  cold_outreach: "Cold Outreach",
  other: "Other",
};

export default function LeadsPage() {
  const leads = useQuery(api.leads.getLeads);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredLeads = leads?.filter((lead) => {
    const matchesFilter = filter === "all" || lead.status === filter;
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-600">Manage your potential clients</p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-black focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {leads === undefined ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredLeads?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No leads found</p>
          <Link
            href="/leads/new"
            className="mt-2 inline-block text-sm text-black underline"
          >
            Add your first lead
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLeads?.map((lead) => (
            <Link
              key={lead._id}
              href={`/leads/${lead._id}`}
              className="block rounded-lg border bg-white p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{lead.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[lead.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  {lead.company && (
                    <p className="text-sm text-gray-600">{lead.company}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{sourceLabels[lead.source] || lead.source}</span>
                    {lead.email && <span>{lead.email}</span>}
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
