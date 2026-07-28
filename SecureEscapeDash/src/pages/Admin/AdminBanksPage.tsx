import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import StatsGrid from "../../components/Dashboard/StatsGrid";
import StatCard from "../../components/Dashboard/StatCard";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function AdminBanksPage() {
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();
        setSessions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load bank stats.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "Active").length;
    const resolved = sessions.filter((s) => s.caseStatus === "Resolved").length;
    const highRisk = sessions.filter(
      (s) => s.highestSeverity === "High" || s.highestSeverity === "Critical",
    ).length;

    return {
      total,
      active,
      resolved,
      highRisk,
    };
  }, [sessions]);

  return (
    <Layout>
      <h1 className="dashboard-title">Bank Stats</h1>
      <p className="dashboard-subtitle mb-8">
        Platform-level bank and duress activity statistics.
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <StatsGrid>
        <StatCard title="Connected Banks" value={loading ? "..." : 1} />
        <StatCard
          title="Duress Sessions"
          value={loading ? "..." : stats.total}
        />
        <StatCard
          title="Active Sessions"
          value={loading ? "..." : stats.active}
          valueColor="text-orange-600"
        />
        <StatCard
          title="High Risk Events"
          value={loading ? "..." : stats.highRisk}
          valueColor="text-red-600"
        />
      </StatsGrid>

      <div className="dashboard-card dashboard-card-body">
        <h2 className="section-title">Bank Integration Overview</h2>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Bank
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Duress Sessions
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Active
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Resolved
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-slate-200">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  GlobalOne Bank
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700">{stats.total}</td>
                <td className="px-5 py-4 text-slate-700">{stats.active}</td>
                <td className="px-5 py-4 text-slate-700">{stats.resolved}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
