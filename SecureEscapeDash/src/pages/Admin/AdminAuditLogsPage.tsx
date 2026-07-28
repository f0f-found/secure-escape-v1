import Layout from "../../components/Layout";

const sampleLogs = [
  {
    id: "1",
    eventType: "DuressSessionCreated",
    actor: "System",
    entity: "UserSession",
    severity: "High",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    eventType: "NotificationDispatched",
    actor: "System",
    entity: "NotificationAttempt",
    severity: "Medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    eventType: "CaseStatusUpdated",
    actor: "Fraud Manager",
    entity: "UserSession",
    severity: "Low",
    createdAt: new Date().toISOString(),
  },
];

export default function AdminAuditLogsPage() {
  return (
    <Layout>
      <h1 className="dashboard-title">Audit Logs</h1>
      <p className="dashboard-subtitle mb-8">
        System activity and administrative audit trail.
      </p>

      <div className="dashboard-card overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="section-title">Recent System Events</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live audit log integration will connect to the backend audit
            endpoint.
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Event
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Actor
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Entity
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Severity
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {sampleLogs.map((log) => (
              <tr key={log.id} className="border-t border-slate-200">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {log.eventType}
                </td>
                <td className="px-6 py-4 text-slate-600">{log.actor}</td>
                <td className="px-6 py-4 text-slate-600">{log.entity}</td>
                <td className="px-6 py-4 text-slate-600">{log.severity}</td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
