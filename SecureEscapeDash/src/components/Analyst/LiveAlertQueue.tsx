import {
  ArrowUpRight,
  Clock3,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DuressSessionSummary } from "../../types/session";
import SeverityBadge from "../SeverityBadge";

type LiveAlertQueueProps = {
  sessions: DuressSessionSummary[];
};

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

function getRelativeTime(dateString: string) {
  const startedAt = new Date(dateString).getTime();
  const now = Date.now();

  const differenceMinutes = Math.max(
    0,
    Math.floor((now - startedAt) / (1000 * 60)),
  );

  if (differenceMinutes < 1) {
    return "Just now";
  }

  if (differenceMinutes < 60) {
    return `${differenceMinutes}m ago`;
  }

  const hours = Math.floor(differenceMinutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

export default function LiveAlertQueue({
  sessions,
}: LiveAlertQueueProps) {
  const navigate = useNavigate();

  const visibleSessions = [...sessions]
    .sort((a, b) => {
      const severityDifference =
        getSeverityPriority(b.highestSeverity) -
        getSeverityPriority(a.highestSeverity);

      if (severityDifference !== 0) {
        return severityDifference;
      }

      if (
        !a.assignedAdminUserId &&
        b.assignedAdminUserId
      ) {
        return -1;
      }

      if (
        a.assignedAdminUserId &&
        !b.assignedAdminUserId
      ) {
        return 1;
      }

      return (
        new Date(b.startedAt).getTime() -
        new Date(a.startedAt).getTime()
      );
    })
    .slice(0, 5);

  const criticalCount = sessions.filter(
    (session) =>
      session.highestSeverity === "Critical" ||
      session.highestSeverity === "High",
  ).length;

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#FEF3F2] text-[#B42318]">
            <ShieldAlert
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="eyebrow">
              Immediate attention
            </p>

            <h2 className="panel-heading">
              Live investigation queue
            </h2>

            <p className="panel-description">
              New active duress incidents waiting for
              analyst attention.
            </p>
          </div>
        </div>

        <span className="panel-count">
          {sessions.length}
        </span>
      </div>

      <div className="grid grid-cols-2 border-b border-[#E5EDF3] bg-[#FBFDFE]">
        <div className="border-r border-[#E5EDF3] px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Waiting
          </p>

          <p className="mt-1 text-xl font-semibold text-[#0B2545]">
            {sessions.length}
          </p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Critical / high
          </p>

          <p className="mt-1 text-xl font-semibold text-[#B42318]">
            {criticalCount}
          </p>
        </div>
      </div>

      {visibleSessions.length === 0 ? (
        <div className="flex min-h-[286px] flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <Search size={19} strokeWidth={1.8} />
          </div>

          <p className="font-semibold text-[#102A43]">
            No investigations waiting
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            New active duress incidents will appear here when
            they require analyst attention.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E8EEF3]">
          {visibleSessions.map((session) => {
            const isUnassigned =
              !session.assignedAdminUserId;

            return (
              <div
                key={session.id}
                className="group flex flex-col gap-4 px-5 py-4 transition duration-150 hover:bg-[#F8FBFD] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="live-dot" />

                    <p className="truncate font-semibold text-[#102A43]">
                      {session.customerName ||
                        "Unknown customer"}
                    </p>

                    <SeverityBadge
                      severity={
                        session.highestSeverity
                      }
                    />
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {session.customerEmail}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {getRelativeTime(
                        session.startedAt,
                      )}
                    </span>

                    <span>
                      {session.alertCount} alert
                      {session.alertCount === 1
                        ? ""
                        : "s"}
                    </span>

                    <span
                      className={
                        isUnassigned
                          ? "font-semibold text-[#1769AA]"
                          : "font-medium text-slate-600"
                      }
                    >
                      {isUnassigned
                        ? "Unassigned"
                        : `Assigned to ${
                            session.assignedAdminName ??
                            "analyst"
                          }`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/sessions/${session.id}`,
                    )
                  }
                  className="flex shrink-0 items-center justify-center gap-2 border border-[#1769AA] bg-white px-3.5 py-2 text-sm font-semibold text-[#1769AA] transition hover:bg-[#1769AA] hover:text-white"
                >
                  Investigate
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}