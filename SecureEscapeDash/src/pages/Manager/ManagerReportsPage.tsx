import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import StatsGrid from "../../components/Dashboard/StatsGrid";
import StatCard from "../../components/Dashboard/StatCard";
import CaseTable from "../../components/Dashboard/CaseTable";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function ManagerReportsPage() {
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
          err instanceof Error ? err.message : "Failed to load reports.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const report = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "Active").length;
    const pendingReview = sessions.filter(
      (s) => s.managerReviewStatus === "PendingReview",
    ).length;

    const approved = sessions.filter(
      (s) => s.managerReviewStatus === "Approved",
    ).length;

    const rejected = sessions.filter(
      (s) => s.managerReviewStatus === "Rejected",
    ).length;
    const falseAlarms = sessions.filter(
      (s) => s.caseStatus === "FalseAlarm",
    ).length;
    const highRisk = sessions.filter(
      (s) => s.highestSeverity === "High" || s.highestSeverity === "Critical",
    ).length;

    const resolutionRate =
      total === 0 ? 0 : Math.round((approved / total) * 100);

    return {
      total,
      active,
      rejected,
      approved,
      falseAlarms,
      highRisk,
      pendingReview,
      resolutionRate,
    };
  }, [sessions]);

  const recentlyResolved = sessions
    .filter((s) => s.managerReviewStatus === "Approved")
    .slice(0, 8);

  return (
    <Layout>
      <h1 className="dashboard-title">Reports</h1>
      <p className="dashboard-subtitle mb-8">
        Case outcomes, response load and investigation performance.
      </p>

      <StatsGrid>
        <StatCard title="Total Cases" value={report.total} />
        <StatCard
          title="Active Cases"
          value={report.active}
          valueColor="text-orange-600"
        />
        <StatCard
          title="High Risk"
          value={report.highRisk}
          valueColor="text-red-600"
        />
        <StatCard
          title="Resolution Rate"
          value={`${report.resolutionRate}%`}
          valueColor="text-green-600"
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card dashboard-card-body">
          <p className="kpi-title">Approved Resolutions</p>
          <h2 className="kpi-value text-green-600">{report.approved}</h2>
        </div>

        <div className="dashboard-card dashboard-card-body">
          <p className="kpi-title">Rejected Reports</p>
          <h2 className="kpi-value text-red-600">{report.rejected}</h2>
        </div>

        <div className="dashboard-card dashboard-card-body">
          <p className="kpi-title">Pending Manager Review</p>
          <h2 className="kpi-value text-indigo-600">{report.pendingReview}</h2>
        </div>

        <div className="dashboard-card dashboard-card-body">
          <p className="kpi-title">False Alarms</p>
          <h2 className="kpi-value text-slate-900">{report.falseAlarms}</h2>
        </div>

        <div className="dashboard-card dashboard-card-body">
          <p className="kpi-title">Pending Manager Review</p>
          <h2 className="kpi-value text-indigo-600">{report.pendingReview}</h2>
        </div>
      </div>

      <CaseTable sessions={recentlyResolved} loading={loading} error={error} />
    </Layout>
  );
}
