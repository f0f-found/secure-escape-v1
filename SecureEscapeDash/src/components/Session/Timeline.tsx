import {
  Bell,
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
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

  // Alerts
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
        title: `${notification.channel} Notification`,
        description: `${notification.status} • ${notification.destination}`,
        timestamp: new Date(notification.createdAt),
      });
    });
  });

  // Analyst actions
  session.actions.forEach((action) => {
    events.push({
      id: `action-${action.id}`,
      type: "action",
      title: action.actionType,
      description: action.notes ?? action.adminName,
      timestamp: new Date(action.createdAt),
    });
  });

  // Case resolved
  if (session.caseResolvedAt) {
    events.push({
      id: "resolved",
      type: "status",
      title: "Case Resolved",
      timestamp: new Date(session.caseResolvedAt),
    });
  }

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Investigation Timeline
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Chronological history of this investigation.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 ml-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
                <div className="absolute -left-[14px] top-1 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                  <TimelineIcon type={event.type} />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="mt-1 text-sm text-slate-600">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm text-slate-500">
                    <p>{event.timestamp.toLocaleTimeString()}</p>

                    <p className="text-xs">
                      {event.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineIconProps {
  type: TimelineEvent["type"];
}

function TimelineIcon({ type }: TimelineIconProps) {
  switch (type) {
    case "alert":
      return <ShieldAlert className="text-red-600" size={14} />;

    case "notification":
      return <Bell className="text-indigo-600" size={14} />;

    case "action":
      return <ClipboardCheck className="text-green-600" size={14} />;

    case "status":
      return <ShieldCheck className="text-amber-600" size={14} />;

    default:
      return <UserCheck className="text-slate-500" size={14} />;
  }
}
