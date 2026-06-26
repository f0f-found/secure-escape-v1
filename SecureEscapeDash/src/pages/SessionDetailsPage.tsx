import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import type { DuressSessionDetail } from "../types/session";
import {
  getDuressSessionById,
  updateCaseStatus,
  addCaseAction,
} from "../services/sessionService";

const CASE_STATUSES = ["Open", "Investigating", "Resolved", "FalseAlarm"];
const ACTION_TYPES = [
  "Viewed",
  "Assigned",
  "CalledUser",
  "FrozeAccount",
  "ContactedAuthorities",
  "MarkedFalseAlarm",
  "Resolved",
];

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<DuressSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusNotes, setStatusNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [addingAction, setAddingAction] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessionById(id);
        setSession(data);
        setSelectedStatus(data.caseStatus);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !id) return;
    try {
      setUpdatingStatus(true);
      await updateCaseStatus(id, selectedStatus, statusNotes);
      const data = await getDuressSessionById(id);
      setSession(data);
      setStatusNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddAction = async () => {
    if (!actionType || !id) return;
    try {
      setAddingAction(true);
      await addCaseAction(id, actionType, actionNotes);
      const data = await getDuressSessionById(id);
      setSession(data);
      setActionType("");
      setActionNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add action.");
    } finally {
      setAddingAction(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="text-gray-400 p-8 text-center">Loading session...</div>
      </Layout>
    );

  if (error || !session)
    return (
      <Layout>
        <div className="text-red-400 p-8 text-center">
          {error || "Session not found."}
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wide">
              Duress Session
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">
              {session.customerName}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {session.customerEmail} · {session.customerPhoneNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <StatusBadge status={session.status} />
            <SeverityBadge severity={session.caseStatus} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* LEFT COLUMN — session info + alerts + transactions */}
          <div className="col-span-2 space-y-6">
            {/* Session Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Session Info</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Session ID", value: session.id },
                  { label: "Mode", value: session.mode },
                  { label: "IP Address", value: session.ipAddress || "—" },
                  { label: "Device", value: session.deviceInfo || "—" },
                  {
                    label: "Started",
                    value: new Date(session.startedAt).toLocaleString(),
                  },
                  {
                    label: "Ended",
                    value: session.endedAt
                      ? new Date(session.endedAt).toLocaleString()
                      : "Still active",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-gray-400">{item.label}</p>
                    <p className="text-white font-medium mt-0.5 break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Log */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Alert Log</h2>
              {session.alerts.length === 0 ? (
                <p className="text-gray-500 text-sm">No alerts recorded.</p>
              ) : (
                <div className="space-y-4">
                  {session.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border border-gray-800 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <SeverityBadge severity={alert.severity} />
                          <span className="text-white font-medium text-sm">
                            {alert.type}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {alert.description}
                      </p>

                      {/* Notification attempts */}
                      {alert.notificationAttempts.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {alert.notificationAttempts.map((n) => (
                            <div
                              key={n.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  n.status === "Sent"
                                    ? "bg-green-400"
                                    : n.status === "Failed"
                                      ? "bg-red-400"
                                      : "bg-yellow-400"
                                }`}
                              />
                              <span className="text-gray-400">{n.channel}</span>
                              <span className="text-gray-500">→</span>
                              <span className="text-gray-400">
                                {n.destination}
                              </span>
                              <span
                                className={`font-medium ${
                                  n.status === "Sent"
                                    ? "text-green-400"
                                    : n.status === "Failed"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {n.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Transactions</h2>
              {session.transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No transactions during this session.
                </p>
              ) : (
                <div className="space-y-3">
                  {session.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-gray-800 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              tx.flagged
                                ? "bg-red-900 text-red-300"
                                : "bg-gray-800 text-gray-300"
                            }`}
                          >
                            {tx.flagged ? "Flagged" : "Clean"}
                          </span>
                          <span className="text-white font-semibold text-sm">
                            R {tx.amount.toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {tx.transactionType}
                          </span>
                        </div>
                        <StatusBadge status={tx.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div>
                          <p className="text-gray-500">Reference</p>
                          <p className="text-gray-300">{tx.bankReference}</p>
                        </div>
                        {tx.secureEscapeCode && (
                          <div>
                            <p className="text-gray-500">SE Code</p>
                            <p className="text-indigo-400 font-mono">
                              {tx.secureEscapeCode}
                            </p>
                          </div>
                        )}
                        {tx.statusReason && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Reason</p>
                            <p className="text-gray-300">{tx.statusReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Events */}
            {session.locations.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">
                  Location Events
                </h2>
                <div className="space-y-2">
                  {session.locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between text-sm border border-gray-800 rounded-xl px-4 py-3"
                    >
                      <div>
                        <span className="text-white font-mono">
                          {loc.latitude}, {loc.longitude}
                        </span>
                        <span className="text-gray-500 ml-3 text-xs">
                          ±{loc.accuracyMeters}m · {loc.locationSource}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {new Date(loc.capturedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — case management */}
          <div className="space-y-6">
            {/* Case Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Case Status</h2>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-indigo-500"
              >
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={3}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm mb-3 resize-none focus:outline-none focus:border-indigo-500 placeholder-gray-500"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
              {session.caseResolvedAt && (
                <p className="text-gray-500 text-xs mt-3 text-center">
                  Resolved at{" "}
                  {new Date(session.caseResolvedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Add Action */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Record Action</h2>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select action type</option>
                {ACTION_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Notes"
                rows={3}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm mb-3 resize-none focus:outline-none focus:border-indigo-500 placeholder-gray-500"
              />
              <button
                onClick={handleAddAction}
                disabled={addingAction || !actionType}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                {addingAction ? "Saving..." : "Record Action"}
              </button>
            </div>

            {/* Action History */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Action History</h2>
              {session.actions.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No actions recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {session.actions.map((action) => (
                    <div
                      key={action.id}
                      className="border border-gray-800 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">
                          {action.actionType}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(action.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {action.adminName && (
                        <p className="text-indigo-400 text-xs mb-1">
                          {action.adminName}
                        </p>
                      )}
                      {action.notes && (
                        <p className="text-gray-400 text-xs">{action.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
