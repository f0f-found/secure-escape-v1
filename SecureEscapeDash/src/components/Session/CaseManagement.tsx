import {
  BellRing,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";

import type { DuressSessionDetail } from "../../types/session";

interface CaseManagementProps {
  session: DuressSessionDetail;

  freezingAccounts: boolean;
  handleFreezeAccounts: () => void;

  dispatchingNotifications: boolean;
  handleDispatchNotifications: () => void;

  canFreezeAccounts: boolean;
  canDispatchNotifications: boolean;
}

export default function CaseManagement({
  session,
  freezingAccounts,
  handleFreezeAccounts,
  dispatchingNotifications,
  handleDispatchNotifications,
  canFreezeAccounts,
  canDispatchNotifications,
}: CaseManagementProps) {
  if (!canFreezeAccounts && !canDispatchNotifications) {
    return null;
  }

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-red-50 text-red-600">
            <ShieldAlert size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="eyebrow">
              Response controls
            </p>

            <h2 className="panel-heading">
              Emergency actions
            </h2>

            <p className="panel-description">
              Protective actions available during the
              duress response.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {canFreezeAccounts && (
          <ActionCard
            icon={<LockKeyhole size={18} />}
            title="Protect customer accounts"
            description={
              session.accountsFrozen
                ? "Account protection has already been activated for this incident."
                : "Freeze the customer's accounts to prevent further unauthorised transactions."
            }
            tone="danger"
          >
            <button
              onClick={handleFreezeAccounts}
              disabled={
                freezingAccounts ||
                session.accountsFrozen
              }
              className={`w-full border px-4 py-3 text-sm font-semibold transition ${
                session.accountsFrozen
                  ? "cursor-not-allowed border-green-200 bg-green-50 text-green-700"
                  : "border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {session.accountsFrozen
                ? "Accounts protected"
                : freezingAccounts
                  ? "Protecting accounts..."
                  : "Freeze customer accounts"}
            </button>
          </ActionCard>
        )}

        {canDispatchNotifications && (
          <ActionCard
            icon={<BellRing size={18} />}
            title="Emergency notifications"
            description="Retry any emergency notifications that are still pending or were not successfully delivered."
            tone="primary"
          >
            <button
              onClick={
                handleDispatchNotifications
              }
              disabled={
                dispatchingNotifications
              }
              className="w-full border border-[#1769AA] bg-white px-4 py-3 text-sm font-semibold text-[#1769AA] transition hover:bg-[#1769AA] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dispatchingNotifications
                ? "Dispatching notifications..."
                : "Retry pending notifications"}
            </button>
          </ActionCard>
        )}
      </div>

      <div className="border-t border-[#E5EDF3] bg-[#FBFDFE] px-5 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Emergency actions are recorded as part of the
          incident response history.
        </p>
      </div>
    </section>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "danger" | "primary";
  children: React.ReactNode;
}

function ActionCard({
  icon,
  title,
  description,
  tone,
  children,
}: ActionCardProps) {
  const iconStyles =
    tone === "danger"
      ? "bg-red-50 text-red-600"
      : "bg-[#EAF4FB] text-[#1769AA]";

  return (
    <div className="border border-[#DCE6EE] bg-[#FBFDFE] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center ${iconStyles}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#102A43]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}