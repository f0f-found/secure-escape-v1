import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleUserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SeverityBadge from "../SeverityBadge";
import type { DuressSessionSummary } from "../../types/session";

interface CaseTableProps {
  sessions: DuressSessionSummary[];
  loading: boolean;
  error: string;
}

function getSeverityPriority(severity: string) {
  switch (severity) {
    case "Critical":
      return 4;
    case "High":
      return 3;
    case "Medium":
      return 2;
    case "Low":
      return 1;
    default:
      return 0;
  }
}

function getCaseStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "border-red-200 bg-red-50 text-red-700";

    case "Investigating":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "FalseAlarm":
      return "border-slate-200 bg-slate-50 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatCaseStatus(status: string) {
  if (status === "FalseAlarm") {
    return "False alarm";
  }

  return status;
}

export default function CaseTable({
  sessions,
  loading,
  error,
}: CaseTableProps) {
  const navigate = useNavigate();

  const sortedSessions = [...sessions].sort((a, b) => {
    const severityDifference =
      getSeverityPriority(b.highestSeverity) -
      getSeverityPriority(a.highestSeverity);

    if (severityDifference !== 0) {
      return severityDifference;
    }

    if (!a.assignedAdminUserId && b.assignedAdminUserId) {
      return -1;
    }

    if (a.assignedAdminUserId && !b.assignedAdminUserId) {
      return 1;
    }

    return (
      new Date(b.startedAt).getTime() -
      new Date(a.startedAt).getTime()
    );
  });

  const unassignedCount = sessions.filter(
    (session) => !session.assignedAdminUserId,
  ).length;

  if (loading) {
    return (
      <section className="dashboard-panel">
        <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
          Loading cases...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-panel">
        <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm text-red-600">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <BriefcaseBusiness
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="eyebrow">
              Case monitoring
            </p>

            <h2 className="panel-heading">
              Priority cases
            </h2>

            <p className="panel-description">
              High-priority duress investigations requiring
              analyst review.
            </p>
          </div>
        </div>

        <span className="panel-count">
          {sessions.length}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5EDF3] bg-[#FBFDFE] px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Priority cases
            </span>

            <span className="ml-2 text-sm font-bold text-[#102A43]">
              {sessions.length}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Unassigned
            </span>

            <span
              className={`ml-2 text-sm font-bold ${
                unassignedCount > 0
                  ? "text-[#B45309]"
                  : "text-[#16815D]"
              }`}
            >
              {unassignedCount}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-400">
          Ordered by severity and urgency
        </p>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
              <BriefcaseBusiness
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <p className="font-semibold text-[#102A43]">
              No priority cases
            </p>

            <p className="mt-1 text-sm text-slate-500">
              There are no high-priority cases in the
              selected period.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead>
              <tr className="border-b border-[#DCE6EE] bg-[#F4F8FB]">
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Alerts
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Severity
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Case status
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Assigned
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Started
                </th>

                <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8EEF3]">
              {sortedSessions.map((session) => {
                const isUnassigned =
                  !session.assignedAdminUserId;

                return (
                  <tr
                    key={session.id}
                    className="group bg-white transition duration-150 hover:bg-[#F8FBFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#D7E4EE] bg-[#F4F8FB] text-[#365C7D]">
                          <CircleUserRound
                            size={17}
                            strokeWidth={1.7}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#102A43]">
                            {session.customerName ||
                              "Unknown customer"}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                            {session.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {session.alertTypes.length > 0 ? (
                          session.alertTypes
                            .slice(0, 2)
                            .map((alert) => (
                              <span
                                key={alert}
                                className="border border-[#D8E3EC] bg-[#F8FBFD] px-2 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {alert}
                              </span>
                            ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No alerts
                          </span>
                        )}

                        {session.alertTypes.length > 2 && (
                          <span className="border border-[#D8E3EC] bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">
                            +
                            {session.alertTypes.length -
                              2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <SeverityBadge
                        severity={
                          session.highestSeverity
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex border px-2.5 py-1 text-xs font-semibold ${getCaseStatusClasses(
                          session.caseStatus,
                        )}`}
                      >
                        {formatCaseStatus(
                          session.caseStatus,
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {isUnassigned ? (
                        <div>
                          <p className="text-sm font-semibold text-[#B45309]">
                            Unassigned
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Analyst required
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-[#102A43]">
                            {session.assignedAdminName ||
                              "Assigned analyst"}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Case owner
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#102A43]">
                        {new Date(
                          session.startedAt,
                        ).toLocaleDateString(
                          "en-ZA",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(
                          session.startedAt,
                        ).toLocaleTimeString(
                          "en-ZA",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/sessions/${session.id}`,
                          )
                        }
                        className="inline-flex items-center gap-2 border border-[#1769AA] bg-white px-3 py-2 text-sm font-semibold text-[#1769AA] transition hover:bg-[#1769AA] hover:text-white"
                      >
                        {session.caseStatus ===
                        "Investigating"
                          ? "Continue"
                          : "Open case"}

                        <ArrowUpRight
                          size={14}
                          strokeWidth={2}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
