import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import StatsGrid from "../../components/Dashboard/StatsGrid";
import StatCard from "../../components/Dashboard/StatCard";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();
        setSessions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load platform dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  const stats = useMemo(() => {
    return {
      totalDuressSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === "Active").length,
      resolvedCases: sessions.filter((s) => s.caseStatus === "Resolved").length,
      highRiskEvents: sessions.filter(
        (s) => s.highestSeverity === "High" || s.highestSeverity === "Critical",
      ).length,
    };
  }, [sessions]);

  return (
    <Layout>
      <h1 className="dashboard-title">Secure Escape Admin</h1>
      <p className="dashboard-subtitle mb-8">
        Platform-level monitoring without customer investigation details.
      </p>

      {error && (
        <div className="mb-6   border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <StatsGrid>
        <StatCard
          title="Total Duress Sessions"
          value={loading ? "..." : stats.totalDuressSessions}
        />
        <StatCard
          title="Active Sessions"
          value={loading ? "..." : stats.activeSessions}
          valueColor="text-orange-600"
        />
        <StatCard
          title="Resolved Cases"
          value={loading ? "..." : stats.resolvedCases}
          valueColor="text-green-600"
        />
        <StatCard
          title="High Risk Events"
          value={loading ? "..." : stats.highRiskEvents}
          valueColor="text-red-600"
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card dashboard-card-body">
          <h2 className="section-title">Platform Scope</h2>
          <p className="mt-3 text-slate-600">
            Secure Escape admins can monitor platform health, audit activity,
            bank-level adoption and test users, but should not access private
            customer investigation evidence.
          </p>
        </div>

        <div className="dashboard-card dashboard-card-body">
          <h2 className="section-title">Next Admin Actions</h2>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>Review audit logs</li>
            <li>Check bank integration statistics</li>
            <li>Create or remove test users</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
