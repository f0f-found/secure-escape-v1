import {
  CheckCircle2,
  Clock3,
  Gauge,
  Radio,
} from "lucide-react";
import type { DuressSessionSummary } from "../../types/session";

type ResponsePerformanceProps = {
  sessions: DuressSessionSummary[];
};

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.round(
    milliseconds / 60000,
  );

  if (totalMinutes < 1) {
    return "<1m";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes =
    totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export default function ResponsePerformance({
  sessions,
}: ResponsePerformanceProps) {
  const resolvedSessions = sessions.filter(
    (session) =>
      session.caseStatus === "Resolved",
  );

  const activeSessions = sessions.filter(
    (session) =>
      session.status === "Active",
  );

  const assignedSessions = sessions.filter(
    (session) => session.assignedAt,
  );

  const pendingReviewSessions = sessions.filter(
    (session) =>
      session.resolutionSubmittedAt &&
      !session.managerReviewedAt,
  );

  const averageAssignmentTime =
    assignedSessions.length > 0
      ? assignedSessions.reduce(
          (total, session) => {
            const startedAt = new Date(
              session.startedAt,
            ).getTime();

            const assignedAt = new Date(
              session.assignedAt!,
            ).getTime();

            return (
              total +
              Math.max(
                assignedAt - startedAt,
                0,
              )
            );
          },
          0,
        ) / assignedSessions.length
      : 0;

  const resolutionRate =
    sessions.length > 0
      ? Math.round(
          (resolvedSessions.length /
            sessions.length) *
            100,
        )
      : 0;

  const metrics = [
    {
      label: "Resolution rate",
      value: `${resolutionRate}%`,
      detail: "Cases resolved",
      icon: Gauge,
      iconBg: "bg-[#EAF4FB]",
      iconText: "text-[#1769AA]",
    },
    {
      label: "Avg assignment",
      value:
        assignedSessions.length > 0
          ? formatDuration(
              averageAssignmentTime,
            )
          : "—",
      detail: "Time to analyst",
      icon: Clock3,
      iconBg: "bg-[#FFF7ED]",
      iconText: "text-[#B45309]",
    },
    {
      label: "Resolved",
      value: resolvedSessions.length,
      detail: "Completed cases",
      icon: CheckCircle2,
      iconBg: "bg-[#ECFDF3]",
      iconText: "text-[#16815D]",
    },
    {
      label: "Active now",
      value: activeSessions.length,
      detail: "Live sessions",
      icon: Radio,
      iconBg: "bg-[#FEF3F2]",
      iconText: "text-[#B42318]",
    },
  ];

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <Gauge
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="eyebrow">
              Operational performance
            </p>

            <h2 className="panel-heading">
              Response & resolution
            </h2>

            <p className="panel-description">
              Analyst response and case resolution
              performance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          const addRightBorder =
            index === 0 ||
            index === 2;

          const addBottomBorder =
            index === 0 ||
            index === 1;

          return (
            <div
              key={metric.label}
              className={[
                "bg-white px-5 py-5",
                addRightBorder
                  ? "border-r border-[#E5EDF3]"
                  : "",
                addBottomBorder
                  ? "border-b border-[#E5EDF3]"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
                    {metric.label}
                  </p>

                  <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.02em] text-[#0B2545]">
                    {metric.value}
                  </p>
                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center ${metric.iconBg} ${metric.iconText}`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {metric.detail}
              </p>
            </div>
          );
        })}
      </div>

<div className="border-t border-[#E5EDF3] bg-[#F8FBFD] px-5 py-4">
  {pendingReviewSessions.length > 0 ? (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D97706]" />

      <div>
        <p className="text-xs font-semibold text-[#102A43]">
          Resolution submitted
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {pendingReviewSessions.length}{" "}
          {pendingReviewSessions.length === 1
            ? "case has"
            : "cases have"}{" "}
          been submitted for final review.
        </p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#16815D]" />

      <p className="text-xs font-medium text-slate-500">
        No submitted resolutions are currently pending review.
      </p>
    </div>
  )}
</div>
    </section>
  );
}