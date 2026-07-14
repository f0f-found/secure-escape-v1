import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SeverityBadge from "../components/SeverityBadge";
// import StatusBadge from "../components/StatusBadge";
import type { DuressSessionSummary } from "../types/session";
import { getDuressSessions } from "../services/sessionService";

const STATUS_FILTERS = ["All", "Active", "Expired", "Terminated"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const activeDuressSessions = sessions.filter(
    (s) => s.status === "Active",
  ).length;

  const resolvedCases = sessions.filter(
    (s) => s.status === "Terminated" || s.status === "Expired",
  ).length;

  const recentSessions = [...sessions]
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 6);

  const filteredSessions =
    filter === "All" ? sessions : sessions.filter((s) => s.status === filter);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();
        setSessions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sessions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
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
            Monitor active duress sessions and resolved cases.
          </p>
        </div>

        {/* Top stats cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="text-left bg-gray-900 border border-red-900/40 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">Active Duress Sessions</p>
            <p className="text-4xl font-bold text-red-400 mt-3">
              {activeDuressSessions}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Currently active sessions
            </p>
          </div>

          <div className="text-left bg-gray-900 border border-green-900/40 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">Ended Sessions</p>
            <p className="text-4xl font-bold text-green-400 mt-3">
              {resolvedCases}
            </p>
            <p className="text-xs text-gray-500 mt-3">Terminated or expired</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Recent Sessions</p>
                <h2 className="text-white font-semibold mt-1">
                  Latest Activity
                </h2>
              </div>
            </div>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-gray-500 py-6">
                No recent sessions available.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="border border-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-800 transition"
                  >
                    <p className="text-sm font-semibold text-white">
                      {session.customerName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {session.alertTypes.join(", ")} ·{" "}
                      {new Date(session.startedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              color: "text-white",
            },
            {
              label: "Active",
              value: sessions.filter((s) => s.status === "Active").length,
              color: "text-red-400",
            },
            {
              label: "Investigating",
              value: sessions.filter((s) => s.highestSeverity === "Critical")
                .length,
              color: "text-yellow-400",
            },
            { label: "Ended", value: resolvedCases, color: "text-green-400" },
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

        {/* Filter tabs */}
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

        {/* Sessions table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              Loading sessions...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No sessions found. Duress sessions will appear here once
              triggered.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Alert Types
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Alerts
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                    Started
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session, idx) => (
                  <tr
                    key={session.id}
                    className={`border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer ${
                      idx === filteredSessions.length - 1 ? "border-b-0" : ""
                    }`}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-white">
                        {session.customerName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.customerEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {session.alertTypes.join(", ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white font-semibold">
                        {session.alertCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={session.highestSeverity} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">{session.status}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {new Date(session.startedAt).toLocaleString()}
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
