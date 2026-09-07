import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";
import CaseTable from "../../components/Dashboard/CaseTable";
import WelcomeBanner from "../../components/Analyst/WelcomeBanner";
import CaseStats from "../../components/Analyst/CaseStats";
import IncidentTrendChart from "../../components/Analyst/IncidentTrendChart";
import RiskMap from "../../components/Analyst/RiskMap";
import LiveAlertQueue from "../../components/Analyst/LiveAlertQueue";
import ResponsePerformance from "../../components/Analyst/ResponsePerformance";
import { getAdminUser } from "../../utils/tokenStore";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function AnalystDashboard() {
  const admin = getAdminUser();

  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);

        const data = await getDuressSessions();

        setSessions(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sessions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    if (period === "all") {
      return sessions;
    }

    const days = Number(period);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return sessions.filter(
      (session) =>
        new Date(session.startedAt) >= cutoff,
    );
  }, [period, sessions]);

  const operationalCases = filteredSessions.filter(
    (session) =>
      session.caseStatus === "Open" ||
      session.caseStatus === "Investigating",
  );

  const liveSessions = filteredSessions.filter(
    (session) => session.status === "Active",
  );

  const investigationQueue = sessions.filter(
    (session) =>
      session.status === "Active" &&
      session.caseStatus === "Open" &&
      !session.assignedAdminUserId,
  );

  const criticalCases = operationalCases.filter(
    (session) =>
      session.highestSeverity === "High" ||
      session.highestSeverity === "Critical",
  );

  const assignedToMe = operationalCases.filter(
    (session) =>
      session.assignedAdminUserId ===
      admin?.adminUserId,
  );

  const unassignedCases = operationalCases.filter(
    (session) => !session.assignedAdminUserId,
  );

  const today = startOfToday();

  const resolvedToday = sessions.filter((session) => {
    if (
      session.caseStatus !== "Resolved" ||
      !session.managerReviewedAt
    ) {
      return false;
    }

    return (
      new Date(session.managerReviewedAt) >= today
    );
  }).length;

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px]">
        <WelcomeBanner
          fullName={admin?.fullName}
          period={period}
          onPeriodChange={setPeriod}
        />

        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <CaseStats
            activeCases={liveSessions.length}
            criticalCases={criticalCases.length}
            assignedCases={assignedToMe.length}
            unassignedCases={unassignedCases.length}
            resolvedToday={resolvedToday}
          />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.85fr]">
            <IncidentTrendChart
              sessions={filteredSessions}
              period={period}
            />

            <RiskMap />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <LiveAlertQueue
              sessions={investigationQueue}
            />

            <ResponsePerformance
              sessions={filteredSessions}
            />
          </div>

          <CaseTable
            sessions={criticalCases.slice(0, 10)}
            loading={loading}
            error=""
          />
        </div>
      </div>
    </Layout>
  );
}
