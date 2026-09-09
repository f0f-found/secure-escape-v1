import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

import Layout from "../../components/Layout";
import SearchBar from "../../components/Dashboard/SearchBar";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

function getSeverityClasses(severity: string) {
  switch (severity) {
    case "Critical":
      return "border-red-200 bg-red-50 text-red-700";

    case "High":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-ZA");
}

export default function ManagerResolvedPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<
    DuressSessionSummary[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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
            : "Failed to load resolved cases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const resolvedSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions
      .filter(
        (session) =>
          session.caseStatus === "Resolved",
      )
      .filter((session) => {
        if (!query) {
          return true;
        }

        const searchableValues = [
          session.customerName,
          session.customerEmail,
          session.id,
          session.highestSeverity,
          session.assignedAdminName,
        ];

        return searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );
      })
      .sort((a, b) => {
        const aTime = a.managerReviewedAt
          ? new Date(a.managerReviewedAt).getTime()
          : 0;

        const bTime = b.managerReviewedAt
          ? new Date(b.managerReviewedAt).getTime()
          : 0;

        return bTime - aTime;
      });
  }, [sessions, search]);

  const highPriorityCount = resolvedSessions.filter(
    (session) =>
      session.highestSeverity === "Critical" ||
      session.highestSeverity === "High",
  ).length;

  const approvedCount = resolvedSessions.filter(
    (session) =>
      session.managerReviewStatus === "Approved",
  ).length;

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">
              Case history
            </p>

            <h1 className="dashboard-title">
              Resolved Cases
            </h1>

            <p className="dashboard-subtitle mt-1">
              View completed fraud investigations and
              previously resolved duress cases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="border border-[#D5E1EB] bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Resolved cases
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#102A43]">
                {resolvedSessions.length}
              </p>
            </div>

            <div className="border border-[#D5E1EB] bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                High priority
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#102A43]">
                {highPriorityCount}
              </p>
            </div>

            <div className="border border-[#D5E1EB] bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Manager approved
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#102A43]">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search customer, case ID, analyst or severity..."
          />
        </div>

        <section className="dashboard-panel overflow-hidden">
          <div className="dashboard-panel-header">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-green-50 text-green-600">
                <CheckCircle2
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="eyebrow">
                  Completed investigations
                </p>

                <h2 className="panel-heading">
                  Resolved Case History
                </h2>

                <p className="panel-description">
                  Completed cases retained for management
                  oversight and historical reference.
                </p>
              </div>
            </div>

            <span className="panel-count">
              {resolvedSessions.length}{" "}
              {resolvedSessions.length === 1
                ? "case"
                : "cases"}
            </span>
          </div>

          {error && (
            <div className="border-b border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-5 py-14 text-center">
              <Clock3
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading resolved cases...
              </p>
            </div>
          ) : resolvedSessions.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <CheckCircle2
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-[#102A43]">
                No resolved cases found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Cases will appear here after the manager
                approves the final investigation report.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-[#F3F7FA]">
                  <tr className="border-b border-[#DCE6EE]">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Severity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Analyst
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Resolution
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Resolved
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {resolvedSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-[#E7EEF4] transition last:border-b-0 hover:bg-[#F8FBFD]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#102A43]">
                          {session.customerName ||
                            "Unknown customer"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {session.customerEmail}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          {session.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${getSeverityClasses(
                            session.highestSeverity,
                          )}`}
                        >
                          {(session.highestSeverity ===
                            "Critical" ||
                            session.highestSeverity ===
                              "High") && (
                            <ShieldAlert size={12} />
                          )}

                          {session.highestSeverity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#102A43]">
                          {session.assignedAdminName ||
                            "Fraud analyst"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Investigation owner
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Resolved
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-[#102A43]">
                          {formatDateTime(
                            session.managerReviewedAt,
                          )}
                        </p>

                        {session.managerReviewStatus ===
                          "Approved" && (
                          <p className="mt-0.5 text-xs text-green-600">
                            Manager approved
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/sessions/${session.id}`,
                            )
                          }
                          className="inline-flex items-center gap-2 border border-[#1769AA] bg-white px-3 py-2 text-xs font-semibold text-[#1769AA] transition hover:bg-[#1769AA] hover:text-white"
                        >
                          View case
                          <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}