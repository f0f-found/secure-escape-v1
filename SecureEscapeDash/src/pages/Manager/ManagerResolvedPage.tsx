import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import CaseTable from "../../components/Dashboard/CaseTable";
import SearchBar from "../../components/Dashboard/SearchBar";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function ManagerResolvedPage() {
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
        setError(
          err instanceof Error ? err.message : "Failed to load resolved cases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const resolvedSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const isResolved = session.managerReviewStatus === "PendingReview";

      const matchesSearch =
        !query ||
        session.customerName.toLowerCase().includes(query) ||
        session.customerEmail.toLowerCase().includes(query) ||
        session.id.toLowerCase().includes(query) ||
        session.highestSeverity.toLowerCase().includes(query);

      return isResolved && matchesSearch;
    });
  }, [sessions, search]);

  return (
    <Layout>
      <h1 className="dashboard-title">Pending Resolution Reviews</h1>
      <p className="dashboard-subtitle mb-8">
        Review analyst-submitted case reports waiting for manager approval.{" "}
      </p>

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search resolved cases..."
        />
      </div>

      <CaseTable sessions={resolvedSessions} loading={loading} error={error} />
    </Layout>
  );
}
