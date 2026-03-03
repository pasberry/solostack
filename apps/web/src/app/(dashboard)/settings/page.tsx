"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const settings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateUserSettings);

  const [formData, setFormData] = useState({
    reminderLeadDays: 7,
    reminderProposalDays: 14,
    reminderInvoiceDays: 30,
    reminderEmailEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        reminderLeadDays: settings.reminderLeadDays,
        reminderProposalDays: settings.reminderProposalDays,
        reminderInvoiceDays: settings.reminderInvoiceDays,
        reminderEmailEnabled: settings.reminderEmailEnabled,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (settings === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your preferences</p>
      </div>

      {/* Reminder Settings */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Reminders</h2>
        <p className="mb-4 text-sm text-gray-600">
          Configure when you want to be reminded about follow-ups
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Remind me about leads not contacted in
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="30"
                value={formData.reminderLeadDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderLeadDays: parseInt(e.target.value) || 7,
                  })
                }
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Remind me about stale proposals after
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={formData.reminderProposalDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderProposalDays: parseInt(e.target.value) || 14,
                  })
                }
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Remind me about overdue invoices after
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="90"
                value={formData.reminderInvoiceDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderInvoiceDays: parseInt(e.target.value) || 30,
                  })
                }
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="reminderEmailEnabled"
              checked={formData.reminderEmailEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reminderEmailEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="reminderEmailEnabled" className="text-sm font-medium">
              Enable reminder emails
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Settings saved!</span>
          )}
        </div>
      </div>

      {/* About */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">About</h2>
        <p className="text-sm text-gray-600">
          SoloStack - CRM for Solo IT Consultants
        </p>
        <p className="text-sm text-gray-500">Version 0.1.0</p>
      </div>
    </div>
  );
}
