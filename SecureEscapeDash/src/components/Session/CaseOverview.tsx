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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between p-8 border-b border-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Fraud Case
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {session.customerName}
          </h1>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>{session.customerEmail}</span>

            <span>•</span>

            <span>{session.customerPhoneNumber}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <StatusBadge status={session.status} />
          <SeverityBadge severity={session.highestSeverity} />
        </div>
      </div>

      {/* Case Information */}
      <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-slate-200">
        <InfoItem label="Case Status" value={session.caseStatus} />

        <InfoItem
          label="Assigned To"
          value={
            session.assignedAdminName ?? (assignedToMe ? "You" : "Unassigned")
          }
        />

        <InfoItem label="Started" value={started.toLocaleString()} />

        <InfoItem label="Mode" value={session.mode} />
        <InfoItem label="Case ID" value={session.id} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 border-t border-slate-200">
        <StatCard
          label="Alerts"
          value={session.alertCount}
          valueClass="text-red-600"
        />

        <StatCard
          label="Transactions"
          value={session.transactionCount}
          valueClass="text-slate-900"
        />

        <StatCard
          label="Locations"
          value={session.locationCount}
          valueClass="text-indigo-600"
        />

        <StatCard
          label="Notifications"
          value={session.notificationAttemptCount}
          valueClass="text-amber-600"
        />
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900 break-words">{value}</p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  valueClass?: string;
}

function StatCard({
  label,
  value,
  valueClass = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>

      <p className={`mt-3 text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
