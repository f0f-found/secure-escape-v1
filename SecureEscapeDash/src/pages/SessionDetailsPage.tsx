import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import type { DuressSessionDetail } from "../types/session";
import {
  getDuressSessionById,
  updateCaseStatus,
  addCaseAction,
  freezeSessionAccounts,
  dispatchSessionNotifications,
} from "../services/sessionService";
import {
  ACTION_TYPES,
  CASE_STATUSES,
  cleanText,
  validateActionType,
  validateCaseStatus,
  validateOptionalNotes,
} from "../utils/validation";
import { getAdminUser } from "../utils/tokenStore";
import type { AdminLoginResponse } from "../types/auth";
import CaseOverview from "../components/Session/CaseOverview";
import InvestigationPanel from "../components/Session/InvestigationPanel";
import CaseManagement from "../components/Session/CaseManagement";
import Timeline from "../components/Session/Timeline";
import EvidencePanel from "../components/Session/EvidencePanel";
import { ADMIN_ROLES } from "../constants/roles";
import { hasPermission } from "../constants/permission";
import CaseReportForm from "../components/Session/CaseReportForm";
import ManagerReviewForm from "../components/Session/ManagerReviewForm";
import CaseStageTracker from "../components/Session/CaseStageTracker";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const admin = getAdminUser();

  const [session, setSession] = useState<DuressSessionDetail | null>(null);
  const isAssignedToMe = session?.assignedAdminUserId === admin?.adminUserId;
  const isUnassigned = !session?.assignedAdminUserId;
  const canViewAnyCaseDetails = hasPermission(
    admin?.adminRole,
    "viewAnyCaseDetails",
  );
  const canViewAssignedCaseDetails =
    hasPermission(admin?.adminRole, "viewAssignedCaseDetails") &&
    isAssignedToMe;
  const canViewFullCase = canViewAnyCaseDetails || canViewAssignedCaseDetails;

  const canAssignCases = hasPermission(admin?.adminRole, "assignCases");
  const canUpdateCaseStatus = hasPermission(
    admin?.adminRole,
    "updateCaseStatus",
  );
  const canRecordCaseAction = hasPermission(
    admin?.adminRole,
    "recordCaseAction",
  );
  const canFreezeAccounts = hasPermission(admin?.adminRole, "freezeAccounts");
  const canDispatchNotifications = hasPermission(
    admin?.adminRole,
    "dispatchNotifications",
  );

  const isSecureEscapeAdmin =
    admin?.adminRole === ADMIN_ROLES.SecureEscapeAdmin;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusNotes, setStatusNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFormError, setStatusFormError] = useState("");

  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [addingAction, setAddingAction] = useState(false);
  const [actionFormError, setActionFormError] = useState("");

  const [freezingAccounts, setFreezingAccounts] = useState(false);
  const [dispatchingNotifications, setDispatchingNotifications] =
    useState(false);

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

  const handleStatusUpdate = async (status?: string) => {
    const newStatus = status ?? selectedStatus;

    if (!newStatus || !id) return;

    const cleanedNotes = cleanText(statusNotes);
    const validationError =
      validateCaseStatus(newStatus) || validateOptionalNotes(cleanedNotes);

    setStatusFormError(validationError);

    if (validationError) return;

    try {
      setUpdatingStatus(true);
      const updatedSession = await updateCaseStatus(
        id,
        newStatus,
        cleanedNotes,
      );

      setSession(updatedSession);
      setSelectedStatus(updatedSession.caseStatus);
      setStatusNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddAction = async () => {
    if (!actionType || !id) return;

    const cleanedNotes = cleanText(actionNotes);
    const validationError =
      validateActionType(actionType) || validateOptionalNotes(cleanedNotes);

    setActionFormError(validationError);

    if (validationError) return;

    try {
      setAddingAction(true);
      const updatedSession = await addCaseAction(id, actionType, cleanedNotes);

      setSession(updatedSession);
      setActionType("");
      setActionNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add action.");
    } finally {
      setAddingAction(false);
    }
  };

  const handleFreezeAccounts = async () => {
    if (!id) return;

    try {
      setFreezingAccounts(true);
      const updatedSession = await freezeSessionAccounts(id);
      setSession(updatedSession);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to freeze accounts.");
    } finally {
      setFreezingAccounts(false);
    }
  };

  const handleDispatchNotifications = async () => {
    if (!id) return;

    try {
      setDispatchingNotifications(true);
      const updatedSession = await dispatchSessionNotifications(id);
      setSession(updatedSession);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to dispatch notifications.",
      );
    } finally {
      setDispatchingNotifications(false);
    }
  };

  const handleReturnNavigate = (admin: AdminLoginResponse) => {
    switch (admin.adminRole) {
      case ADMIN_ROLES.FraudAnalyst:
        navigate("/analyst");
        break;

      case ADMIN_ROLES.FraudManager:
        navigate("/manager");
        break;

      case ADMIN_ROLES.SecureEscapeAdmin:
      case ADMIN_ROLES.SystemAdmin:
        navigate("/admin");
        break;

      default:
        navigate("/login");
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

  const canSubmitCaseReport =
    admin?.adminRole === ADMIN_ROLES.FraudAnalyst &&
    isAssignedToMe &&
    session.caseStatus === "Investigating";

  const canManagerReview =
    (admin?.adminRole === ADMIN_ROLES.FraudManager ||
      admin?.adminRole === ADMIN_ROLES.SystemAdmin) &&
    session.managerReviewStatus === "PendingReview";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => handleReturnNavigate(admin!)}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <CaseOverview session={session} assignedToMe={isAssignedToMe} />

        <div className="mt-6">
          <CaseStageTracker session={session} />
        </div>

        <div className="mt-6">
          {isUnassigned && canAssignCases && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
              <h2 className="text-xl font-semibold text-amber-900">
                Claim Investigation
              </h2>
              <p className="mt-2 text-amber-700">
                This case has not yet been assigned to an analyst.
              </p>
              <p className="mt-1 text-amber-700">
                Begin the investigation to assign this case to yourself and
                unlock customer evidence.
              </p>
              <button
                onClick={() => handleStatusUpdate("Investigating")}
                disabled={updatingStatus}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
              >
                {updatingStatus ? "Assigning..." : "Begin Investigation"}
              </button>
            </div>
          )}

          {isUnassigned && !canAssignCases && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Awaiting Assignment
              </h2>
              <p className="mt-2 text-slate-600">
                This case has not yet been assigned to an analyst.
              </p>
            </div>
          )}

          {!isUnassigned && !canViewFullCase && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Investigation In Progress
              </h2>
              <p className="mt-2 text-slate-600">
                This case is currently assigned to another fraud analyst.
              </p>
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Assigned To</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {session.assignedAdminName}
                </p>
                {session.assignedAt && (
                  <>
                    <p className="mt-4 text-sm text-slate-500">Assigned At</p>
                    <p className="mt-1 text-slate-900">
                      {new Date(session.assignedAt).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {!isUnassigned && canViewFullCase && !isSecureEscapeAdmin && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 space-y-6">
                <InvestigationPanel session={session} />
                <EvidencePanel session={session} />
                <Timeline session={session} />
              </div>

              <div className="col-span-4 space-y-6">
                {canSubmitCaseReport && (
                  <CaseReportForm session={session} onSubmitted={setSession} />
                )}

                {canManagerReview && (
                  <ManagerReviewForm
                    session={session}
                    onReviewed={setSession}
                  />
                )}

                {session.managerReviewStatus === "Approved" && (
                  <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-green-800">
                      Case Resolved
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {session.resolutionSummary}
                    </p>
                    {session.managerReviewedAt && (
                      <p className="mt-4 text-xs text-slate-500">
                        Approved{" "}
                        {new Date(session.managerReviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <CaseManagement
                  session={session}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  statusNotes={statusNotes}
                  setStatusNotes={setStatusNotes}
                  statusFormError={statusFormError}
                  updatingStatus={updatingStatus}
                  handleStatusUpdate={handleStatusUpdate}
                  freezingAccounts={freezingAccounts}
                  handleFreezeAccounts={handleFreezeAccounts}
                  dispatchingNotifications={dispatchingNotifications}
                  handleDispatchNotifications={handleDispatchNotifications}
                  actionType={actionType}
                  setActionType={setActionType}
                  actionNotes={actionNotes}
                  setActionNotes={setActionNotes}
                  actionFormError={actionFormError}
                  addingAction={addingAction}
                  handleAddAction={handleAddAction}
                  canUpdateCaseStatus={canUpdateCaseStatus}
                  canRecordCaseAction={canRecordCaseAction}
                  canFreezeAccounts={canFreezeAccounts}
                  canDispatchNotifications={canDispatchNotifications}
                  CASE_STATUSES={CASE_STATUSES}
                  ACTION_TYPES={ACTION_TYPES}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
