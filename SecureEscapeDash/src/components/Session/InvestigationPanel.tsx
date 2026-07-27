import SeverityBadge from "../SeverityBadge";
import type { DuressSessionDetail } from "../../types/session";

interface InvestigationPanelProps {
  session: DuressSessionDetail;
}

export default function InvestigationPanel({
  session,
}: InvestigationPanelProps) {
  return (
    <div className="space-y-6">
      {/* Alert Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Alert Timeline
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Chronological list of alerts generated during this session.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {session.alerts.length} Alert
            {session.alerts.length !== 1 && "s"}
          </div>
        </div>

        {session.alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No alerts have been generated for this case.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {session.alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        alert.severity === "Critical"
                          ? "bg-red-600"
                          : alert.severity === "High"
                            ? "bg-orange-500"
                            : alert.severity === "Medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={alert.severity} />

                        <h3 className="font-semibold text-slate-900">
                          {alert.type}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {alert.description}
                      </p>

                      {alert.notificationAttempts.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                            Notification Attempts
                          </p>

                          <div className="space-y-2">
                            {alert.notificationAttempts.map((notification) => (
                              <div
                                key={notification.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {notification.channel}
                                  </p>

                                  <p className="text-sm text-slate-500">
                                    {notification.destination}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    notification.status === "Sent"
                                      ? "bg-green-100 text-green-700"
                                      : notification.status === "Failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {notification.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Session Details
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Technical information collected during the customer's session.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <DetailItem label="Session ID" value={session.id} mono />

          <DetailItem label="Mode" value={session.mode} />

          <DetailItem
            label="IP Address"
            value={session.ipAddress ?? "Unknown"}
          />

          <DetailItem label="Device" value={session.deviceInfo ?? "Unknown"} />

          <DetailItem
            label="Started"
            value={new Date(session.startedAt).toLocaleString()}
          />

          <DetailItem
            label="Ended"
            value={
              session.endedAt
                ? new Date(session.endedAt).toLocaleString()
                : "Session still active"
            }
          />
        </div>
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function DetailItem({ label, value, mono = false }: DetailItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-slate-900 ${
          mono ? "font-mono text-sm break-all" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
