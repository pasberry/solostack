"use client";

import { useQuery, useMutation } from "@/app/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function TimeEntriesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { project, timeEntries } = useQuery(api.projects.getProject, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectId: projectId as any,
  }) || { project: null, timeEntries: [] };

  const startTimer = useMutation(api.time.startTimer);
  const stopTimer = useMutation(api.time.stopTimer);
  const deleteEntry = useMutation(api.time.deleteTimeEntry);
  const addManual = useMutation(api.time.addManualEntry);

  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ description: "", hours: "1" });
  const [runningEntry, setRunningEntry] = useState<{_id: string; startTime: number} | null>(null);

  // Show a simple indicator - time will update on next render
  const timerDisplay = runningEntry ? "Timer running" : null;

  const handleStart = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entryId = await startTimer({ projectId: projectId as any, description: "" });
    setRunningEntry({ _id: entryId, startTime: Date.now() });
  };

  const handleStop = async () => {
    if (runningEntry) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await stopTimer({ entryId: runningEntry._id as any });
      setRunningEntry(null);
    }
  };

  const handleManual = async () => {
    const hours = parseFloat(manualForm.hours);
    const now = Date.now();
    const startTime = now - hours * 60 * 60 * 1000;
    await addManual({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectId: projectId as any,
      description: manualForm.description || undefined,
      startTime,
      endTime: now,
    });
    setShowManual(false);
    setManualForm({ description: "", hours: "1" });
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Delete this time entry?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteEntry({ entryId: entryId as any });
  };

  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="p-6 max-w-4xl">
      <Link href={`/projects/${projectId}`} className="text-sm text-blue-600 hover:underline mb-2 block">
        ← Back to Project
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Time Entries</h1>
          <p className="text-gray-600">{project?.name}</p>
        </div>
        <div className="text-lg font-semibold">
          Total: {totalHours}h
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {!runningEntry ? (
          <button
            onClick={handleStart}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>▶</span> Start Timer
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <span>■</span> Stop Timer
          </button>
        )}
        <button
          onClick={() => setShowManual(!showManual)}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          + Manual Entry
        </button>
      </div>

      {runningEntry && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Timer running</span>
            <span className="text-gray-500">
              ({timerDisplay})
            </span>
          </div>
        </div>
      )}

      {showManual && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h3 className="font-medium mb-3">Add Manual Entry</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Description (optional)"
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={manualForm.hours}
              onChange={(e) => setManualForm({ ...manualForm, hours: e.target.value })}
              className="border rounded px-3 py-2"
              placeholder="Hours"
            />
            <div className="flex gap-2">
              <button
                onClick={handleManual}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowManual(false)}
                className="border px-3 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {timeEntries.length === 0 ? (
        <div className="text-gray-500 text-center py-12 border rounded-lg">
          No time entries yet. Start the timer to begin tracking.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium">Date</th>
                <th className="text-left px-4 py-2 text-sm font-medium">Description</th>
                <th className="text-right px-4 py-2 text-sm font-medium">Duration</th>
                <th className="text-right px-4 py-2 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries
                .sort((a, b) => b.startTime - a.startTime)
                .map((entry) => (
                  <tr key={entry._id} className="border-t">
                    <td className="px-4 py-2 text-sm">
                      {new Date(entry.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm">{entry.description || "-"}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {entry.duration ? (entry.duration / 60).toFixed(1) + "h" : "Running..."}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
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