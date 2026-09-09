import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  ShieldAlert,
} from "lucide-react";

import type { DuressSessionDetail } from "../../types/session";

interface TimelineProps {
  session: DuressSessionDetail;
}

interface TimelineEvent {
  id: string;
  type: "alert" | "action" | "notification" | "status";
  title: string;
  description?: string;
  timestamp: Date;
}

export default function Timeline({ session }: TimelineProps) {
  const events: TimelineEvent[] = [];

  session.alerts.forEach((alert) => {
    events.push({
      id: `alert-${alert.id}`,
      type: "alert",
      title: alert.type,
      description: alert.description,
      timestamp: new Date(alert.createdAt),
    });

    alert.notificationAttempts.forEach((notification) => {
      events.push({
        id: `notification-${notification.id}`,
        type: "notification",
        title: `${notification.channel} notification`,
        description: `${notification.status} • ${notification.destination}`,
        timestamp: new Date(notification.createdAt),
      });
    });
  });

  session.actions.forEach((action) => {
    events.push({
      id: `action-${action.id}`,
      type: "action",
      title: formatActionTitle(action.actionType),
      description: action.notes ?? action.adminName,
      timestamp: new Date(action.createdAt),
    });
  });

  if (session.caseResolvedAt) {
    events.push({
      id: "resolved",
      type: "status",
      title: "Case resolved",
      description: "The investigation was formally closed.",
      timestamp: new Date(session.caseResolvedAt),
    });
  }

  events.sort(
    (a, b) =>
      b.timestamp.getTime() -
      a.timestamp.getTime(),
  );

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <History size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="eyebrow">
              Case activity
            </p>

            <h2 className="panel-heading">
              Investigation timeline
            </h2>

            <p className="panel-description">
              Chronological record of alerts, analyst
              actions, notifications and case updates.
            </p>
          </div>
        </div>

        <span className="panel-count">
          {events.length}{" "}
          {events.length === 1
            ? "event"
            : "events"}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-[190px] items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-400">
              <Clock3 size={19} />
            </div>

            <p className="mt-4 font-semibold text-[#102A43]">
              No activity recorded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Investigation events will appear here as the
              case progresses.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="relative ml-4 border-l border-[#D7E2EA]">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="relative pb-7 pl-8 last:pb-0"
              >
                <div className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center border border-[#D7E2EA] bg-white">
                  <TimelineIcon
                    type={event.type}
                  />
                </div>

                <div className="border border-[#E1EAF1] bg-[#FBFDFE] p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#102A43]">
                          {event.title}
                        </h3>

                        {index === 0 && (
                          <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1769AA]">
                            Latest
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs font-semibold text-[#102A43]">
                        {event.timestamp.toLocaleTimeString(
                          "en-ZA",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {event.timestamp.toLocaleDateString(
                          "en-ZA",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface TimelineIconProps {
  type: TimelineEvent["type"];
}

function TimelineIcon({
  type,
}: TimelineIconProps) {
  switch (type) {
    case "alert":
      return (
        <ShieldAlert
          className="text-red-600"
          size={14}
        />
      );

    case "notification":
      return (
        <Bell
          className="text-[#1769AA]"
          size={14}
        />
      );

    case "action":
      return (
        <ClipboardCheck
          className="text-emerald-600"
          size={14}
        />
      );

    case "status":
      return (
        <CheckCircle2
          className="text-emerald-600"
          size={14}
        />
      );

    default:
      return (
        <Clock3
          className="text-slate-500"
          size={14}
        />
      );
  }
}

function formatActionTitle(actionType: string) {
  if (!actionType) return "Case action";

  return actionType
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}