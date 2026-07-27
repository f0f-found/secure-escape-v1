import { useNavigate } from "react-router-dom";
import type { DuressSessionSummary } from "../../types/session";
import SeverityBadge from "../SeverityBadge";

interface CaseQueueProps {
  sessions: DuressSessionSummary[];
}

export default function CaseQueue({ sessions }: CaseQueueProps) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <div className="dashboard-card dashboard-card-body my-5">
        <h2 className="section-title mb-4">Investigation Queue</h2>

        <p className="text-slate-500">
          There are currently no cases awaiting investigation.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card dashboard-card-body my-5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title">Investigation Queue</h2>

          <p className="text-sm text-slate-500 mt-1">
            Cases requiring analyst attention.
          </p>
        </div>

        <span className="bg-red-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
          {sessions.length} Active/Open
        </span>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {session.customerName}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {session.customerEmail}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {session.alertTypes.map((alert) => (
                    <span
                      key={alert}
                      className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-lg"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>

              <SeverityBadge severity={session.highestSeverity} />
            </div>

            <div className="flex justify-between items-center mt-5">
              <p className="text-sm text-slate-500">
                Started {new Date(session.startedAt).toLocaleString()}
              </p>

              <button
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Investigate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
