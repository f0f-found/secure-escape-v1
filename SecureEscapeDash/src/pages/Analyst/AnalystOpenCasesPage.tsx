import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import CaseTable from "../../components/Dashboard/CaseTable";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function AnalystOpenCasesPage() {
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
          err instanceof Error ? err.message : "Failed to load open cases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const openCases = useMemo(() => {
    return sessions.filter(
      (session) =>
        !session.assignedAdminUserId &&
        session.caseStatus !== "Resolved" &&
        session.caseStatus !== "FalseAlarm",
    );
  }, [sessions]);

  return (
    <Layout>
      <h1 className="dashboard-title">Open Cases</h1>
      <p className="dashboard-subtitle mb-8">
        Unclaimed cases that still need analyst ownership.
      </p>

      <CaseTable sessions={openCases} loading={loading} error={error} />
    </Layout>
  );
}
