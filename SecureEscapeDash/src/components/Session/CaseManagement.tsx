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
    <div className="bg-white   border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Emergency Actions
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Actions available during live duress response.
        </p>
      </div>

      <div className="p-6 space-y-3">
        {canFreezeAccounts && (
          <button
            onClick={handleFreezeAccounts}
            disabled={freezingAccounts || session.accountsFrozen}
            className="w-full   bg-red-600 py-3 text-white font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {session.accountsFrozen
              ? "Accounts Frozen"
              : freezingAccounts
                ? "Freezing..."
                : "Freeze Customer Accounts"}
          </button>
        )}

        {canDispatchNotifications && (
          <button
            onClick={handleDispatchNotifications}
            disabled={dispatchingNotifications}
            className="w-full   bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            {dispatchingNotifications
              ? "Dispatching..."
              : "Retry Pending Notifications"}
          </button>
        )}
      </div>
    </div>
  );
}
