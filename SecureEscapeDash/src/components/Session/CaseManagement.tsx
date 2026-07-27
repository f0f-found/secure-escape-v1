import type { DuressSessionDetail } from "../../types/session";

interface CaseManagementProps {
  session: DuressSessionDetail;

  selectedStatus: string;
  setSelectedStatus: (value: string) => void;

  statusNotes: string;
  setStatusNotes: (value: string) => void;

  statusFormError: string;

  updatingStatus: boolean;
  handleStatusUpdate: () => void;

  freezingAccounts: boolean;
  handleFreezeAccounts: () => void;

  dispatchingNotifications: boolean;
  handleDispatchNotifications: () => void;

  actionType: string;
  setActionType: (value: string) => void;

  actionNotes: string;
  setActionNotes: (value: string) => void;

  actionFormError: string;

  addingAction: boolean;
  handleAddAction: () => void;

  CASE_STATUSES: readonly string[];
  ACTION_TYPES: readonly string[];
}

export default function CaseManagement({
  session,

  selectedStatus,
  setSelectedStatus,

  statusNotes,
  setStatusNotes,

  statusFormError,

  updatingStatus,
  handleStatusUpdate,

  freezingAccounts,
  handleFreezeAccounts,

  dispatchingNotifications,
  handleDispatchNotifications,

  actionType,
  setActionType,

  actionNotes,
  setActionNotes,

  actionFormError,

  addingAction,
  handleAddAction,

  CASE_STATUSES,
  ACTION_TYPES,
}: CaseManagementProps) {
  return (
    <div className="space-y-6">
      {/* Case Status */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Case Status</h2>

          <p className="text-sm text-slate-500 mt-1">
            Update the current investigation status.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none"
          >
            {CASE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <textarea
            rows={4}
            maxLength={500}
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Reason for changing the case status..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none focus:border-indigo-500 focus:outline-none"
          />

          {statusFormError && (
            <p className="text-sm text-red-600">{statusFormError}</p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {statusNotes.length}/500
            </span>

            <button
              onClick={handleStatusUpdate}
              disabled={updatingStatus}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {updatingStatus ? "Updating..." : "Update Status"}
            </button>
          </div>

          {session.caseResolvedAt && (
            <p className="text-xs text-slate-500">
              Resolved {new Date(session.caseResolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Actions */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Emergency Actions
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Immediate actions affecting the customer account.
          </p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={handleFreezeAccounts}
            disabled={freezingAccounts || session.accountsFrozen}
            className="w-full rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {session.accountsFrozen
              ? "Accounts Frozen"
              : freezingAccounts
                ? "Freezing..."
                : "Freeze Customer Accounts"}
          </button>

          <button
            onClick={handleDispatchNotifications}
            disabled={dispatchingNotifications}
            className="w-full rounded-xl bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            {dispatchingNotifications
              ? "Dispatching..."
              : "Dispatch Pending Notifications"}
          </button>
        </div>
      </div>

      {/* Record Action */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Record Action
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Record manual actions taken during the investigation.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select an action</option>

            {ACTION_TYPES.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <textarea
            rows={4}
            maxLength={500}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            placeholder="Describe the action performed..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none focus:border-indigo-500 focus:outline-none"
          />

          {actionFormError && (
            <p className="text-sm text-red-600">{actionFormError}</p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {actionNotes.length}/500
            </span>

            <button
              onClick={handleAddAction}
              disabled={addingAction || !actionType}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {addingAction ? "Recording..." : "Record Action"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
