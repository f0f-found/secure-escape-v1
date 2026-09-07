import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import Layout from "../../components/Layout";
import type { DuressSessionSummary } from "../../types/session";
import { getDuressSessions } from "../../services/sessionService";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function getWorkflowStage(session: DuressSessionSummary) {
  if (session.managerReviewStatus === "PendingReview") {
    return "Awaiting review";
  }

  if (!session.assignedAdminUserId) {
    return "Needs assignment";
  }

  if (session.caseStatus === "Investigating") {
    return "Investigating";
  }

  return session.caseStatus;
}

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<DuressSessionSummary[]>([]);
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
            : "Failed to load manager dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const activeCases = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.status === "Active" &&
          session.caseStatus !== "Resolved" &&
          session.caseStatus !== "FalseAlarm",
      ),
    [sessions],
  );

  const unassignedCases = useMemo(
    () =>
      sessions.filter(
        (session) =>
          !session.assignedAdminUserId &&
          session.caseStatus !== "Resolved" &&
          session.caseStatus !== "FalseAlarm",
      ),
    [sessions],
  );

  const investigatingCases = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.caseStatus === "Investigating" &&
          session.managerReviewStatus !== "PendingReview",
      ),
    [sessions],
  );

  const awaitingReviewCases = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.managerReviewStatus === "PendingReview",
      ),
    [sessions],
  );

  const resolvedToday = useMemo(() => {
    const today = new Date();

    return sessions.filter((session) => {
      if (
        session.caseStatus !== "Resolved" ||
        !session.managerReviewedAt
      ) {
        return false;
      }

      const reviewedAt = new Date(session.managerReviewedAt);

      return (
        reviewedAt.getFullYear() === today.getFullYear() &&
        reviewedAt.getMonth() === today.getMonth() &&
        reviewedAt.getDate() === today.getDate()
      );
    });
  }, [sessions]);

  const assignmentQueue = useMemo(
    () =>
      [...unassignedCases]
        .sort((a, b) => {
          const severityOrder: Record<string, number> = {
            Critical: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };

          const severityDifference =
            (severityOrder[b.highestSeverity] ?? 0) -
            (severityOrder[a.highestSeverity] ?? 0);

          if (severityDifference !== 0) {
            return severityDifference;
          }

          return (
            new Date(a.startedAt).getTime() -
            new Date(b.startedAt).getTime()
          );
        })
        .slice(0, 5),
    [unassignedCases],
  );

  const reviewQueue = useMemo(
    () =>
      [...awaitingReviewCases]
        .sort((a, b) => {
          const aTime = a.resolutionSubmittedAt
            ? new Date(a.resolutionSubmittedAt).getTime()
            : 0;

          const bTime = b.resolutionSubmittedAt
            ? new Date(b.resolutionSubmittedAt).getTime()
            : 0;

          return bTime - aTime;
        })
        .slice(0, 5),
    [awaitingReviewCases],
  );

  const highRiskCases = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            (session.highestSeverity === "Critical" ||
              session.highestSeverity === "High") &&
            session.caseStatus !== "Resolved" &&
            session.caseStatus !== "FalseAlarm",
        )
        .sort((a, b) => {
          if (
            a.highestSeverity === "Critical" &&
            b.highestSeverity !== "Critical"
          ) {
            return -1;
          }

          if (
            b.highestSeverity === "Critical" &&
            a.highestSeverity !== "Critical"
          ) {
            return 1;
          }

          return (
            new Date(a.startedAt).getTime() -
            new Date(b.startedAt).getTime()
          );
        })
        .slice(0, 6),
    [sessions],
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[520px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E1EB] bg-white shadow-sm">
              <Clock3
                size={22}
                className="text-[#1769AA]"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading manager dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-xl border border-[#163E61] bg-[#102F4A] px-6 py-6 shadow-[0_12px_32px_rgba(15,47,74,0.14)] lg:px-8 lg:py-7">
          <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-blue-200">
                <ShieldCheck size={17} />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Fraud Operations Control
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                Manager Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Oversee active investigations, allocate
                unassigned cases and review analyst reports
                from one operational workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[125px] rounded-lg border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">
                  Total cases
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <UsersRound
                    size={17}
                    className="text-white"
                  />

                  <span className="text-xl font-bold text-white">
                    {sessions.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/manager/resolved")
                }
                className="inline-flex min-h-[54px] items-center gap-2 rounded-lg border border-white/20 bg-white px-4 text-sm font-semibold text-[#123B5D] shadow-sm transition hover:bg-blue-50"
              >
                <FileCheck2 size={16} />

                Resolved Cases

                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI ROW */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#1769AA]" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Active Incidents
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-[#102A43]">
                  {activeCases.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1769AA]">
                <ShieldAlert size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Live duress sessions requiring oversight
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-orange-500" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Unassigned
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-orange-600">
                  {unassignedCases.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <UserRoundCheck size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Cases waiting for analyst allocation
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-500" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Investigating
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-600">
                  {investigatingCases.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <SearchCheck size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Active analyst investigations
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-500" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Awaiting Review
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">
                  {awaitingReviewCases.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ClipboardCheck size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Reports requiring your decision
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-500" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Resolved Today
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {resolvedToday.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Cases closed after manager approval
            </p>
          </div>
        </section>

        {/* MANAGER ACTION CENTRE */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1769AA]">
                Manager Action Centre
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#102A43]">
                Cases requiring attention
              </h2>
            </div>

            <p className="hidden text-xs text-slate-400 md:block">
              Select a case to open the full investigation
              record.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* ASSIGNMENT QUEUE */}
            <section className="overflow-hidden rounded-xl border border-[#D5E1EB] bg-white shadow-[0_7px_22px_rgba(15,47,74,0.06)]">
              <div className="border-b border-[#DFE8EF] bg-gradient-to-r from-[#FFF9EF] to-white px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-orange-600">
                      <UserRoundCheck
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-orange-600">
                        Work Allocation
                      </p>

                      <h3 className="mt-0.5 text-base font-bold text-[#102A43]">
                        Assignment Queue
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Unassigned cases waiting for manager
                        allocation.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                    {unassignedCases.length}
                  </span>
                </div>
              </div>

              {assignmentQueue.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2
                      size={22}
                      className="text-emerald-600"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#102A43]">
                    All cases are assigned
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No operational cases are currently
                    waiting for analyst allocation.
                  </p>
                </div>
              ) : (
                <div>
                  {assignmentQueue.map((session, index) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() =>
                        navigate(`/sessions/${session.id}`)
                      }
                      className="group flex w-full items-center justify-between gap-4 border-b border-[#E7EEF4] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#F8FBFD]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#102A43]">
                              {session.customerName ||
                                "Unknown customer"}
                            </p>

                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getSeverityClasses(
                                session.highestSeverity,
                              )}`}
                            >
                              {session.highestSeverity}
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-500">
                            Opened{" "}
                            {formatDateTime(
                              session.startedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#1769AA]">
                        Assign
                        <ArrowRight
                          size={14}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* REVIEW QUEUE */}
            <section className="overflow-hidden rounded-xl border border-[#D5E1EB] bg-white shadow-[0_7px_22px_rgba(15,47,74,0.06)]">
              <div className="border-b border-[#DFE8EF] bg-gradient-to-r from-[#F1F7FC] to-white px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#1769AA]">
                      <ClipboardCheck
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#1769AA]">
                        Manager Decision
                      </p>

                      <h3 className="mt-0.5 text-base font-bold text-[#102A43]">
                        Awaiting Review
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Analyst reports awaiting approval or
                        return.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1769AA]">
                    {awaitingReviewCases.length}
                  </span>
                </div>
              </div>

              {reviewQueue.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                    <ClipboardCheck
                      size={22}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#102A43]">
                    No reports awaiting review
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Submitted analyst reports will appear
                    here for your final decision.
                  </p>
                </div>
              ) : (
                <div>
                  {reviewQueue.map((session, index) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() =>
                        navigate(`/sessions/${session.id}`)
                      }
                      className="group flex w-full items-center justify-between gap-4 border-b border-[#E7EEF4] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#F8FBFD]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAF4FB] text-xs font-bold text-[#1769AA]">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#102A43]">
                              {session.customerName ||
                                "Unknown customer"}
                            </p>

                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getSeverityClasses(
                                session.highestSeverity,
                              )}`}
                            >
                              {session.highestSeverity}
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-500">
                            {session.assignedAdminName
                              ? `Submitted by ${session.assignedAdminName}`
                              : "Submitted by fraud analyst"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDateTime(
                              session.resolutionSubmittedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#1769AA]">
                        Review
                        <ArrowRight
                          size={14}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* HIGH RISK */}
        <section className="overflow-hidden rounded-xl border border-[#D5E1EB] bg-white shadow-[0_7px_22px_rgba(15,47,74,0.06)]">
          <div className="flex flex-col gap-3 border-b border-[#DFE8EF] bg-gradient-to-r from-[#FFF5F5] via-white to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
                <ShieldAlert
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-red-600">
                  Risk Oversight
                </p>

                <h2 className="mt-0.5 text-base font-bold text-[#102A43]">
                  High-Risk Cases
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Critical and high-severity investigations
                  requiring management awareness.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                {highRiskCases.length} shown
              </span>
            </div>
          </div>

          {highRiskCases.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2
                  size={23}
                  className="text-emerald-600"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-[#102A43]">
                No unresolved high-risk cases
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Critical and high-severity cases will appear
                here when management oversight is required.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#DCE6EE] bg-[#F4F8FB]">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Case
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Severity
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Assigned Analyst
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Workflow Stage
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Opened
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {highRiskCases.map((session) => (
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
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${getSeverityClasses(
                            session.highestSeverity,
                          )}`}
                        >
                          <AlertTriangle size={12} />

                          {session.highestSeverity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#102A43]">
                          {session.assignedAdminName ||
                            "Not assigned"}
                        </p>

                        {!session.assignedAdminUserId && (
                          <p className="mt-0.5 text-[11px] font-medium text-orange-600">
                            Manager action required
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-[#D5E1EB] bg-[#F8FBFD] px-2.5 py-1 text-xs font-medium text-slate-600">
                          {getWorkflowStage(session)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs leading-5 text-slate-500">
                        {formatDateTime(session.startedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/sessions/${session.id}`,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#C9DCEB] bg-white px-3 py-2 text-xs font-semibold text-[#1769AA] transition hover:border-[#1769AA] hover:bg-[#F3F8FC]"
                        >
                          Open case
                          <ArrowRight size={13} />
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