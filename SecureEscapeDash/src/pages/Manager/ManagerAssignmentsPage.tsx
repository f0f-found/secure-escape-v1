import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import AssignmentTable from "../../components/Dashboard/AssignmentTable";
import SearchBar from "../../components/Dashboard/SearchBar";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

export default function ManagerAssignmentsPage() {
  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getDuressSessions();
      setSessions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assignments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesAssignmentFilter =
        !showOnlyUnassigned || !session.assignedAdminUserId;

      const matchesSearch =
        !query ||
        session.customerName.toLowerCase().includes(query) ||
        session.customerEmail.toLowerCase().includes(query) ||
        session.id.toLowerCase().includes(query) ||
        session.caseStatus.toLowerCase().includes(query) ||
        session.highestSeverity.toLowerCase().includes(query);

      return matchesAssignmentFilter && matchesSearch;
    });
  }, [sessions, search, showOnlyUnassigned]);

  return (
    <Layout>
      <h1 className="dashboard-title">Case Assignments</h1>
      <p className="dashboard-subtitle mb-8">
        Review unassigned cases and allocate work to fraud analysts.
      </p>

      <div className="mb-6 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by customer, email, case ID, status or severity..."
        />

        <label className="inline-flex items-center gap-3   bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showOnlyUnassigned}
            onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
          />
          Show only unassigned cases
        </label>
      </div>

      <AssignmentTable
        sessions={filteredSessions}
        loading={loading}
        error={error}
        onAssigned={fetchSessions}
      />
    </Layout>
  );
}
