import { useNavigate } from "react-router-dom";
import SeverityBadge from "../SeverityBadge";
import type { DuressSessionSummary } from "../../types/session";

interface CaseTableProps {
  sessions: DuressSessionSummary[];
  loading: boolean;
  error: string;
}

export default function CaseTable({
  sessions,
  loading,
  error,
}: CaseTableProps) {
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <div>
          <h2 className="section-title">Cases</h2>

          <p className="text-sm text-slate-500">
            Active and historical fraud investigations
          </p>
        </div>

        <span className="text-sm text-slate-500">{sessions.length} Cases</span>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Customer
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Alert
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Severity
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Status
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Started
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
                <div className="flex flex-wrap gap-2">
                  {session.alertTypes.map((alert) => (
                    <span
                      key={alert}
                      className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </td>

              <td className="px-6 py-5">
                <SeverityBadge severity={session.highestSeverity} />
              </td>

              <td className="px-6 py-5">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {session.status}
                </span>
              </td>

              <td className="px-6 py-5 text-slate-600">
                {new Date(session.startedAt).toLocaleString()}
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
