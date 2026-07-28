import { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";
import CaseQueue from "../../components/Dashboard/CaseQueue";
import CaseTable from "../../components/Dashboard/CaseTable";
import WelcomeBanner from "../../components/Analyst/WelcomeBanner";
import CaseStats from "../../components/Analyst/CaseStats";
import { getAdminUser } from "../../utils/tokenStore";

// const STATUS_FILTERS = ["All", "Active", "Expired", "Terminated"];

export default function AnalystDashboard() {
  //const navigate = useNavigate();
  const admin = getAdminUser();
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter] = useState("All");
  const [error, setError] = useState("");
  //const [search, setSearch] = useState("");

  const activeDuressSessions = sessions.filter(
    (s) => s.status === "Active",
  ).length;

  const resolvedCases = sessions.filter(
    (s) => s.caseStatus === "Resolved",
  ).length;

  const investigationQueue = [...sessions]
    .filter((s) => s.status === "Active" || s.caseStatus === "Open")
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5);

  const filteredSessions =
    filter === "All" ? sessions : sessions.filter((s) => s.status === filter);

  const assignedToMe = sessions.filter(
    (s) => s.assignedAdminUserId === admin?.adminUserId,
  );
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
      <WelcomeBanner fullName={admin?.fullName} />

      <CaseStats
        activeCases={activeDuressSessions}
        criticalCases={
          sessions.filter((s) => s.highestSeverity === "High").length
        }
        assignedCases={assignedToMe.length}
        resolvedToday={resolvedCases}
      />

      <CaseQueue sessions={investigationQueue} />

      <CaseTable sessions={filteredSessions} loading={loading} error={error} />
    </Layout>
  );
}
