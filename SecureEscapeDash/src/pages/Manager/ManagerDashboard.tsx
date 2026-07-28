import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import CaseTable from "../../components/Dashboard/CaseTable";
import StatsGrid from "../../components/Dashboard/StatsGrid";
import StatCard from "../../components/Dashboard/StatCard";
import CaseQueue from "../../components/Dashboard/CaseQueue";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function ManagerDashboard() {
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();
        setSessions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load manager dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const unassignedCases = useMemo(
    () => sessions.filter((session) => !session.assignedAdminUserId),
    [sessions],
  );

  const activeCases = sessions.filter((session) => session.status === "Active");
  const investigatingCases = sessions.filter(
    (session) => session.caseStatus === "Investigating",
  );
  const resolvedCases = sessions.filter(
    (session) => session.caseStatus === "Resolved",
  );
  const highRiskCases = sessions.filter(
    (session) =>
      session.highestSeverity === "High" ||
      session.highestSeverity === "Critical",
  );

  return (
    <Layout>
      <h1 className="dashboard-title">Manager Dashboard</h1>
      <p className="dashboard-subtitle mb-8">
        Team-level view of duress sessions, assignments and resolved case
        reviews.
      </p>

      <StatsGrid>
        <StatCard title="Active Cases" value={activeCases.length} />
        <StatCard
          title="Unassigned"
          value={unassignedCases.length}
          valueColor="text-orange-600"
        />
        <StatCard
          title="Investigating"
          value={investigatingCases.length}
          valueColor="text-indigo-600"
        />
        <StatCard
          title="Resolved Review"
          value={resolvedCases.length}
          valueColor="text-green-600"
        />
      </StatsGrid>

      <CaseQueue sessions={unassignedCases.slice(0, 5)} />

      <CaseTable sessions={highRiskCases} loading={loading} error={error} />
    </Layout>
  );
}
