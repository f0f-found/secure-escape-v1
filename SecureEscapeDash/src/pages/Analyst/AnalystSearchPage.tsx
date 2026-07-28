import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import CaseTable from "../../components/Dashboard/CaseTable";
import SearchBar from "../../components/Dashboard/SearchBar";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function AnalystSearchPage() {
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessions();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      return (
        session.customerName.toLowerCase().includes(query) ||
        session.customerEmail.toLowerCase().includes(query) ||
        session.id.toLowerCase().includes(query) ||
        session.caseStatus.toLowerCase().includes(query) ||
        session.status.toLowerCase().includes(query) ||
        session.highestSeverity.toLowerCase().includes(query) ||
        session.alertTypes.some((alert) => alert.toLowerCase().includes(query))
      );
    });
  }, [search, sessions]);

  return (
    <Layout>
      <h1 className="dashboard-title">Search Cases</h1>
      <p className="dashboard-subtitle mb-8">
        Search cases by customer, email, session ID, status, severity or alert
        type.
      </p>

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <CaseTable sessions={filteredSessions} loading={loading} error={error} />
    </Layout>
  );
}
