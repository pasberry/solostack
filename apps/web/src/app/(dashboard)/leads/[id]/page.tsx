"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const sourceLabels: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  website: "Website",
  upwork: "Upwork",
  cold_outreach: "Cold Outreach",
  other: "Other",
};

const actionLabels: Record<string, string> = {
  lead_created: "Lead Created",
  status_changed: "Status Changed",
  email_sent: "Email Sent",
  call_made: "Call Made",
  note_added: "Note Added",
  proposal_sent: "Proposal Sent",
  converted_to_client: "Converted to Client",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const leadData = useQuery(api.leads.getLead, { leadId });
  const updateStatus = useMutation(api.leads.updateStatus);
  const addActivity = useMutation(api.leads.addActivity);
  const convertToClient = useMutation(api.clients.convertToClient);
  const deleteLead = useMutation(api.leads.deleteLead);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityNote, setActivityNote] = useState("");

  const { lead, activities } = leadData || { lead: null, activities: [] };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    await updateStatus({ leadId: lead._id, status: newStatus as LeadStatus });
  };

  const handleAddActivity = async (action: string) => {
    if (!lead) return;
    await addActivity({
      leadId: lead._id,
      action,
      note: activityNote || undefined,
    });
    setActivityNote("");
    setShowActivityForm(false);
  };

  const handleConvertToClient = async () => {
    if (!lead) return;
    const clientId = await convertToClient({ leadId: lead._id });
    router.push(`/clients/${clientId}`);
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead({ leadId: lead._id });
      router.push("/leads");
    }
  };

  if (leadData === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p>Lead not found</p>
        <Link href="/leads" className="text-sm underline">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                statusColors[lead.status]
              }`}
            >
              {lead.status}
            </span>
          </div>
          {lead.company && (
            <p className="text-lg text-gray-600">{lead.company}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Contact Info */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium">Contact Information</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <Mail className="h-4 w-4" />
              {lead.email}
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <Phone className="h-4 w-4" />
              {lead.phone}
            </a>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Source: {sourceLabels[lead.source] || lead.source}
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                lead.status === option.value
                  ? statusColors[option.value]
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {lead.status === "won" && (
          <button
            onClick={handleConvertToClient}
            className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Convert to Client
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Add Note
          </button>
        </div>

        {showActivityForm && (
          <div className="mt-4 space-y-3">
            <textarea
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAddActivity("note_added")}
                className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowActivityForm(false)}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium">Activity</h3>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((activity) => (
                <div
                  key={activity._id}
                  className="border-b pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {actionLabels[activity.action] || activity.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.note && (
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.note}
                    </p>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No activity yet</p>
        )}
      </div>
    </div>
  );
}
