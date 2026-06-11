import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import type { AlertSummary } from "../types/alert";
import { getAlerts } from "../services/alertService";

const STATUS_FILTERS = ["All", "Open", "Investigating", "Resolved", "FalseAlarm"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const activeDuressSessions = alerts.filter(
    (a) => a.type.toLowerCase().includes("duress") && a.status !== "Resolved"
  ).length;

  const resolvedCases = alerts.filter((a) => a.status === "Resolved").length;

  const recentAlerts = [...alerts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await getAlerts(filter === "All" ? undefined : filter);
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wide">
            Fraud Operations Center
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">
            Activity Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Monitor recent fraud alerts, active duress activity, and resolved cases.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <button
            onClick={() => navigate("/sessions")}
            className="text-left bg-gray-900 border border-red-900/40 rounded-2xl p-6 hover:border-red-500 hover:bg-gray-900/80 transition"
          >
            <p className="text-gray-400 text-sm">Active Duress Sessions</p>
            <p className="text-4xl font-bold text-red-400 mt-3">
              {activeDuressSessions}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Click to view duress sessions
            </p>
          </button>

          <button
            onClick={() => setFilter("Resolved")}
            className="text-left bg-gray-900 border border-green-900/40 rounded-2xl p-6 hover:border-green-500 hover:bg-gray-900/80 transition"
          >
            <p className="text-gray-400 text-sm">Resolved Cases</p>
            <p className="text-4xl font-bold text-green-400 mt-3">
              {resolvedCases}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Click to filter resolved alerts
            </p>
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Recent Alerts</p>
                <h2 className="text-white font-semibold mt-1">Latest Activity</h2>
              </div>
            </div>

            {recentAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 py-6">
                No recent alerts available.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                    className="border border-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-800 transition"
                  >
                    <p className="text-sm font-semibold text-white">
                      {alert.customerName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.type} · {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Alerts", value: alerts.length, color: "text-white" },
            {
              label: "Open",
              value: alerts.filter((a) => a.status === "Open").length,
              color: "text-red-400",
            },
            {
              label: "Investigating",
              value: alerts.filter((a) => a.status === "Investigating").length,
              color: "text-yellow-400",
            },
            {
              label: "Resolved",
              value: resolvedCases,
              color: "text-green-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading alerts...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No alerts found. Once alerts are created, they will appear here.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr
                    key={alert.id}
                    className={`border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer ${
                      idx === alerts.length - 1 ? "border-b-0" : ""
                    }`}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-white">{alert.customerName}</p>
                      <p className="text-xs text-gray-400">{alert.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{alert.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-indigo-400 text-sm font-medium">
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
