import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import CaseTable from "../../components/Dashboard/CaseTable";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";
import { getAdminUser } from "../../utils/tokenStore";

export default function AnalystMyCasesPage() {
  const admin = getAdminUser();

  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();

        const assignedToMe = data.filter(
          (session) => session.assignedAdminUserId === admin?.adminUserId,
        );

        setSessions(assignedToMe);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load assigned cases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [admin?.adminUserId]);

  return (
    <Layout>
      <h1 className="dashboard-title">My Cases</h1>
      <p className="dashboard-subtitle mb-8">
        Cases assigned to you for investigation and follow-up.
      </p>

      <CaseTable sessions={sessions} loading={loading} error={error} />
    </Layout>
  );
}
