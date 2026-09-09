import {
  AlertTriangle,
  ArrowUpRight,
  FileSearch,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout";
import SearchBar from "../../components/Dashboard/SearchBar";
import SeverityBadge from "../../components/SeverityBadge";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

function getStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "border-red-200 bg-red-50 text-red-700";

    case "Investigating":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "FalseAlarm":
      return "border-slate-200 bg-slate-50 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatStatus(status: string) {
  return status === "FalseAlarm"
    ? "False alarm"
    : status;
}

function matchesSearch(
  session: DuressSessionSummary,
  query: string,
) {
  const searchableValues = [
    session.id,
    session.customerName,
    session.customerEmail,
    session.caseStatus,
    session.status,
    session.highestSeverity,
    session.assignedAdminName,
    ...(session.alertTypes ?? []),
  ];

  return searchableValues.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

export default function AnalystSearchPage() {
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

        const data =
          await getDuressSessions();

        setSessions(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load cases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const query = search
    .trim()
    .toLowerCase();

  const filteredSessions = useMemo(() => {
    if (!query) {
      return [];
    }

    return sessions
      .filter((session) =>
        matchesSearch(session, query),
      )
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() -
          new Date(a.startedAt).getTime(),
      );
  }, [query, sessions]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px]">
        <section className="mb-5 overflow-hidden border border-[#D9E6F2] bg-[#F4F8FC] shadow-sm">
          <div className="flex items-start gap-4 px-6 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#12355B] text-white">
              <FileSearch
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1769AA]">
                Case investigation
              </p>

              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#0B2545]">
                Search cases
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Find a duress case using customer
                information, case ID, status, severity,
                analyst or alert type.
              </p>
            </div>
          </div>

          <div className="h-1 bg-[#1769AA]" />
        </section>

        <div className="mb-5">
          <SearchBar
            value={search}
            onChange={setSearch}
          />
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle
              size={17}
              className="shrink-0"
            />

            {error}
          </div>
        )}

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
                <Search
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="eyebrow">
                  Case lookup
                </p>

                <h2 className="panel-heading">
                  Search results
                </h2>

                <p className="panel-description">
                  Matching duress investigations and
                  customer cases.
                </p>
              </div>
            </div>

            {query && !loading && (
              <span className="panel-count">
                {filteredSessions.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
              Loading case records...
            </div>
          ) : !query ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
                <Search
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <p className="font-semibold text-[#102A43]">
                Search for a case
              </p>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                Enter a customer name, email address,
                case ID, severity, status, analyst or
                alert type above.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-500">
                <FileSearch
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <p className="font-semibold text-[#102A43]">
                No matching cases
              </p>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                No case records matched
                {" "}
                <span className="font-semibold text-slate-700">
                  “{search.trim()}”
                </span>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-[#E5EDF3] bg-[#FBFDFE] px-5 py-3">
                <p className="text-xs text-slate-500">
                  Found{" "}
                  <span className="font-semibold text-[#102A43]">
                    {filteredSessions.length}
                  </span>{" "}
                  {filteredSessions.length === 1
                    ? "case"
                    : "cases"}{" "}
                  matching{" "}
                  <span className="font-semibold text-[#102A43]">
                    “{search.trim()}”
                  </span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-[#DCE6EE] bg-[#F4F8FB]">
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Customer
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Case ID
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Severity
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Assigned
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Started
                      </th>

                      <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E8EEF3]">
                    {filteredSessions.map(
                      (session) => (
                        <tr
                          key={session.id}
                          className="bg-white transition hover:bg-[#F8FBFD]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#102A43]">
                              {session.customerName ||
                                "Unknown customer"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {session.customerEmail ||
                                "No email available"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p
                              className="max-w-[150px] truncate font-mono text-xs font-medium text-slate-600"
                              title={session.id}
                            >
                              {session.id}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <SeverityBadge
                              severity={
                                session.highestSeverity
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                session.caseStatus,
                              )}`}
                            >
                              {formatStatus(
                                session.caseStatus,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {session.assignedAdminUserId ? (
                              <span className="text-sm text-slate-600">
                                {session.assignedAdminName ||
                                  "Assigned analyst"}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-[#B45309]">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-[#102A43]">
                              {new Date(
                                session.startedAt,
                              ).toLocaleDateString(
                                "en-ZA",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {new Date(
                                session.startedAt,
                              ).toLocaleTimeString(
                                "en-ZA",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() =>
                                navigate(
                                  `/sessions/${session.id}`,
                                )
                              }
                              className="inline-flex items-center gap-2 border border-[#1769AA] bg-white px-3 py-2 text-sm font-semibold text-[#1769AA] transition hover:bg-[#1769AA] hover:text-white"
                            >
                              Open case

                              <ArrowUpRight
                                size={14}
                                strokeWidth={2}
                              />
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}