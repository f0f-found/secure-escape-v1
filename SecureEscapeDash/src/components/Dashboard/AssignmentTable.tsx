import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SeverityBadge from "../SeverityBadge";
import type { DuressSessionSummary } from "../../types/session";

import { getAnalysts, assignCase } from "../../services/sessionService";
import type { AdminUserSummary } from "../../types/auth";

interface AssignmentTableProps {
  sessions: DuressSessionSummary[];
  loading: boolean;
  error: string;
  onAssigned: () => void;
}

export default function AssignmentTable({
  sessions,
  loading,
  error,
  onAssigned,
}: AssignmentTableProps) {
  const navigate = useNavigate();
  const [analysts, setAnalysts] = useState<AdminUserSummary[]>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState<
    Record<string, string>
  >({});
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    getAnalysts()
      .then(setAnalysts)
      .catch(() => setAnalysts([]));
  }, []);

  const handleAssign = async (sessionId: string) => {
    const adminUserId = selectedAnalyst[sessionId];
    if (!adminUserId) return;

    try {
      setAssigning(sessionId);
      await assignCase(
        sessionId,
        adminUserId,
        "Assigned via manager dashboard.",
      );
      onAssigned();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign case.");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-table p-8 text-center text-slate-500">
        Loading cases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-table p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="dashboard-table p-8 text-center text-slate-500">
        No cases found.
      </div>
    );
  }

  return (
    <div className="dashboard-table">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Customer
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Severity
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Assign To
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="border-t border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="px-6 py-5">
                <p className="font-semibold text-slate-900">
                  {session.customerName}
                </p>
                <p className="text-sm text-slate-500">
                  {session.customerEmail}
                </p>
              </td>
              <td className="px-6 py-5">
                <SeverityBadge severity={session.highestSeverity} />
              </td>
              <td className="px-6 py-5 text-slate-600">{session.caseStatus}</td>
              <td className="px-6 py-5">
                {session.assignedAdminName ? (
                  <span className="text-sm text-slate-700">
                    {session.assignedAdminName}
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={selectedAnalyst[session.id] ?? ""}
                      onChange={(e) =>
                        setSelectedAnalyst((prev) => ({
                          ...prev,
                          [session.id]: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select analyst...</option>
                      {analysts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(session.id)}
                      disabled={
                        !selectedAnalyst[session.id] || assigning === session.id
                      }
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {assigning === session.id ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-5 text-right">
                <button
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="bg-[#12355B] hover:bg-[#0B2545] text-white px-4 py-2 rounded-lg transition"
                >
                  Open Case
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
