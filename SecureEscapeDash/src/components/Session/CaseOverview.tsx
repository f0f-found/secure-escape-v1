import {
  BellRing,
  Clock3,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  WalletCards,
} from "lucide-react";

import SeverityBadge from "../SeverityBadge";
import StatusBadge from "../StatusBadge";
import type { DuressSessionDetail } from "../../types/session";

interface CaseOverviewProps {
  session: DuressSessionDetail;
  assignedToMe: boolean;
}

export default function CaseOverview({
  session,
  assignedToMe,
}: CaseOverviewProps) {
  const started = new Date(session.startedAt);

  const assignedAnalyst =
    session.assignedAdminName?.trim() ||
    (assignedToMe ? "You" : "Unassigned");

  const formattedCaseStatus =
    session.caseStatus === "FalseAlarm"
      ? "False alarm"
      : session.caseStatus;

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="border-b border-[#DCE7EF] bg-gradient-to-r from-[#F7FAFD] via-white to-[#F4F8FB]">
        <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {session.status === "Active" && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                </span>
              )}

              <p
                className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
                  session.status === "Active"
                    ? "text-red-600"
                    : "text-[#1769AA]"
                }`}
              >
                {session.status === "Active"
                  ? "Live Duress Incident"
                  : "Duress Case"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#102A43] sm:text-3xl">
                {session.customerName || "Unknown customer"}
              </h1>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              {session.customerEmail && (
                <span className="inline-flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  {session.customerEmail}
                </span>
              )}

              {session.customerPhoneNumber && (
                <span className="inline-flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  {session.customerPhoneNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={session.status} />
            <SeverityBadge severity={session.highestSeverity} />
            <ReviewStatusBadge status={session.managerReviewStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 border-b border-[#E5EDF3] sm:grid-cols-2 xl:grid-cols-5">
        <InfoItem
          icon={<ShieldAlert size={16} />}
          label="Case Status"
          value={formattedCaseStatus}
        />

        <InfoItem
          icon={<UserRound size={16} />}
          label="Assigned To"
          value={assignedAnalyst}
          secondary={
            assignedToMe && session.assignedAdminName
              ? session.assignedAdminName
              : undefined
          }
        />

        <InfoItem
          icon={<Clock3 size={16} />}
          label="Started"
          value={started.toLocaleDateString("en-ZA")}
          secondary={started.toLocaleTimeString("en-ZA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />

        <InfoItem
          icon={<WalletCards size={16} />}
          label="Mode"
          value={session.mode}
        />

        <InfoItem
          icon={<Hash size={16} />}
          label="Case ID"
          value={session.id}
          mono
        />
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-[#E5EDF3] sm:grid-cols-4 sm:divide-y-0">
        <StatItem
          icon={<ShieldAlert size={17} />}
          label="Alerts"
          value={session.alertCount}
          emphasis="danger"
        />

        <StatItem
          icon={<WalletCards size={17} />}
          label="Transactions"
          value={session.transactionCount}
        />

        <StatItem
          icon={<MapPin size={17} />}
          label="Locations"
          value={session.locationCount}
          emphasis="blue"
        />

        <StatItem
          icon={<BellRing size={17} />}
          label="Notifications"
          value={session.notificationAttemptCount}
          emphasis="amber"
        />
      </div>
    </section>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
  mono?: boolean;
}

function InfoItem({
  icon,
  label,
  value,
  secondary,
  mono = false,
}: InfoItemProps) {
  return (
    <div className="min-w-0 border-b border-[#E5EDF3] px-5 py-4 sm:border-b-0 sm:border-r last:border-r-0">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <p className="text-[10px] font-bold uppercase tracking-[0.1em]">
          {label}
        </p>
      </div>

      <p
        className={`mt-2 truncate text-sm font-semibold text-[#102A43] ${
          mono ? "font-mono text-xs" : ""
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {value || "—"}
      </p>

      {secondary && (
        <p className="mt-1 truncate text-xs text-slate-400">
          {secondary}
        </p>
      )}
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  emphasis?: "danger" | "blue" | "amber";
}

function StatItem({
  icon,
  label,
  value,
  emphasis,
}: StatItemProps) {
  const iconStyle =
    emphasis === "danger"
      ? "bg-red-50 text-red-600"
      : emphasis === "blue"
        ? "bg-blue-50 text-[#1769AA]"
        : emphasis === "amber"
          ? "bg-amber-50 text-amber-600"
          : "bg-slate-100 text-slate-500";

  return (
    <div className="flex items-center gap-4 px-5 py-5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center ${iconStyle}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-[#102A43]">
          {value}
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function ReviewStatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "NotSubmitted") return null;

  const styles: Record<string, string> = {
    PendingReview:
      "border-amber-200 bg-amber-50 text-amber-700",
    Approved:
      "border-green-200 bg-green-50 text-green-700",
    Rejected:
      "border-red-200 bg-red-50 text-red-700",
  };

  const labels: Record<string, string> = {
    PendingReview: "Pending review",
    Approved: "Approved",
    Rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
        styles[status] ??
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}