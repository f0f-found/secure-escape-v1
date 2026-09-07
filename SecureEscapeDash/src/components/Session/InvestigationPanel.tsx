import {
  BellRing,
  Clock3,
  Laptop,
  Network,
  Radio,
  ShieldAlert,
} from "lucide-react";

import SeverityBadge from "../SeverityBadge";
import type { DuressSessionDetail } from "../../types/session";

interface InvestigationPanelProps {
  session: DuressSessionDetail;
}

export default function InvestigationPanel({
  session,
}: InvestigationPanelProps) {
  const isLiveSession = session.status === "Active";

  const sortedAlerts = [...session.alerts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <section className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                isLiveSession
                  ? "bg-red-50 text-red-600"
                  : "bg-[#EAF4FB] text-[#1769AA]"
              }`}
            >
              {isLiveSession ? (
                <Radio size={18} strokeWidth={1.8} />
              ) : (
                <ShieldAlert size={18} strokeWidth={1.8} />
              )}
            </div>

            <div>
              <p className="eyebrow">
                Incident monitoring
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="panel-heading">
                  {isLiveSession
                    ? "Live alert feed"
                    : "Alert history"}
                </h2>

                {isLiveSession && (
                  <span className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-red-700">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
                    </span>

                    Live
                  </span>
                )}
              </div>

              <p className="panel-description">
                {isLiveSession
                  ? "Alerts generated while this duress session is still active."
                  : "Alerts recorded during the course of this incident."}
              </p>
            </div>
          </div>

          <span className="panel-count">
            {sortedAlerts.length}{" "}
            {sortedAlerts.length === 1
              ? "alert"
              : "alerts"}
          </span>
        </div>

        {sortedAlerts.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-400">
                <BellRing size={19} />
              </div>

              <p className="mt-4 font-semibold text-[#102A43]">
                No alerts generated
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No alert events have been recorded for
                this case.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5EDF3]">
            {sortedAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="px-5 py-5 transition-colors hover:bg-[#F8FBFD]"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div className="flex min-w-0 gap-4">
                    <div className="pt-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          alert.severity === "Critical"
                            ? "bg-red-600"
                            : alert.severity === "High"
                              ? "bg-orange-500"
                              : alert.severity === "Medium"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge
                          severity={alert.severity}
                        />

                        <h3 className="font-semibold text-[#102A43]">
                          {alert.type}
                        </h3>

                        {index === 0 && (
                          <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1769AA]">
                            Latest
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {alert.description}
                      </p>

                      {alert.notificationAttempts.length >
                        0 && (
                        <div className="mt-5 border-t border-[#E5EDF3] pt-4">
                          <div className="mb-3 flex items-center gap-2">
                            <BellRing
                              size={14}
                              className="text-slate-400"
                            />

                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                              Notification attempts
                            </p>
                          </div>

                          <div className="space-y-2">
                            {alert.notificationAttempts.map(
                              (notification) => (
                                <div
                                  key={notification.id}
                                  className="flex flex-col justify-between gap-3 border border-[#E1EAF1] bg-[#FBFDFE] px-4 py-3 sm:flex-row sm:items-center"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#102A43]">
                                      {
                                        notification.channel
                                      }
                                    </p>

                                    <p className="mt-0.5 break-all text-xs text-slate-500">
                                      {
                                        notification.destination
                                      }
                                    </p>
                                  </div>

                                  <NotificationStatus
                                    status={
                                      notification.status
                                    }
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 lg:text-right">
                    <p className="text-sm font-semibold text-[#102A43]">
                      {new Date(
                        alert.createdAt,
                      ).toLocaleTimeString(
                        "en-ZA",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        alert.createdAt,
                      ).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
              <Laptop size={18} strokeWidth={1.8} />
            </div>

            <div>
              <p className="eyebrow">
                Technical evidence
              </p>

              <h2 className="panel-heading">
                Session details
              </h2>

              <p className="panel-description">
                Device and connection information captured
                during the duress session.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <DetailItem
            icon={<ShieldAlert size={16} />}
            label="Session ID"
            value={session.id}
            mono
          />

          <DetailItem
            icon={<Radio size={16} />}
            label="Mode"
            value={session.mode}
          />

          <DetailItem
            icon={<Network size={16} />}
            label="IP Address"
            value={session.ipAddress ?? "Unknown"}
          />

          <DetailItem
            icon={<Laptop size={16} />}
            label="Device"
            value={session.deviceInfo ?? "Unknown"}
          />

          <DetailItem
            icon={<Clock3 size={16} />}
            label="Started"
            value={new Date(
              session.startedAt,
            ).toLocaleString("en-ZA")}
          />

          <DetailItem
            icon={<Clock3 size={16} />}
            label="Ended"
            value={
              session.endedAt
                ? new Date(
                    session.endedAt,
                  ).toLocaleString("en-ZA")
                : "Session still active"
            }
            active={!session.endedAt}
          />
        </div>
      </section>
    </div>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  active?: boolean;
}

function DetailItem({
  icon,
  label,
  value,
  mono = false,
  active = false,
}: DetailItemProps) {
  return (
    <div className="border-b border-[#E5EDF3] px-5 py-4 sm:border-r">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <p className="text-[10px] font-bold uppercase tracking-[0.1em]">
          {label}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {active && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>
        )}

        <p
          className={`min-w-0 break-words text-sm text-[#102A43] ${
            mono
              ? "font-mono text-xs"
              : "font-semibold"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function NotificationStatus({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "Sent"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "Failed"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`w-fit shrink-0 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${styles}`}
    >
      {status}
    </span>
  );
}