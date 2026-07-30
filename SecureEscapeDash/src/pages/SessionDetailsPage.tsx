import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import type { DuressSessionDetail } from "../types/session";
import {
  getDuressSessionById,
  freezeSessionAccounts,
  dispatchSessionNotifications,
  claimSession,
  assignSession,
} from "../services/sessionService";

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

  const canFreezeAccounts = hasPermission(admin?.adminRole, "freezeAccounts");
  const canDispatchNotifications = hasPermission(
    admin?.adminRole,
    "dispatchNotifications",
  );
  const canClaimCases = hasPermission(admin?.adminRole, "claimCases");

  const isSecureEscapeAdmin =
    admin?.adminRole === ADMIN_ROLES.SecureEscapeAdmin;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [freezingAccounts, setFreezingAccounts] = useState(false);
  const [dispatchingNotifications, setDispatchingNotifications] =
    useState(false);
  const [claimingCase, setClaimingCase] = useState(false);
  const [assigningCase, setAssigningCase] = useState(false);
  const [assignAdminUserId, setAssignAdminUserId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getDuressSessionById(id);
        setSession(data);
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

  const handleClaimSession = async () => {
    if (!id) return;

    try {
      setClaimingCase(true);
      const updatedSession = await claimSession(id);
      setSession(updatedSession);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to claim case.");
    } finally {
      setClaimingCase(false);
    }
  };

  const handleAssignSession = async () => {
    if (!id || !assignAdminUserId.trim()) return;

    try {
      setAssigningCase(true);
      const updatedSession = await assignSession(
        id,
        assignAdminUserId.trim(),
        assignNotes.trim(),
      );
      setSession(updatedSession);
      setAssignAdminUserId("");
      setAssignNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign case.");
    } finally {
      setAssigningCase(false);
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
    session.caseStatus === "Investigating" &&
    session.managerReviewStatus !== "PendingReview" &&
    session.managerReviewStatus !== "Approved";

  const canManagerReview =
    (admin?.adminRole === ADMIN_ROLES.FraudManager ||
      admin?.adminRole === ADMIN_ROLES.SystemAdmin) &&
    session.managerReviewStatus === "PendingReview";

  const isLiveSession = session.status === "Active";
  const isPostIncidentSession =
    session.status === "Expired" || session.status === "Terminated";

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
          {isUnassigned && (
            <div className="  border border-amber-200 bg-amber-50 p-8">
              <h2 className="text-xl font-semibold text-amber-900">
                Unclaimed Investigation
              </h2>

              <p className="mt-2 text-amber-700">
                This case has not yet been claimed by a fraud analyst.
              </p>

              {canClaimCases && (
                <button
                  onClick={handleClaimSession}
                  disabled={claimingCase}
                  className="mt-6   bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
                >
                  {claimingCase ? "Claiming..." : "Claim Case"}
                </button>
              )}

              {canAssignCases && (
                <div className="mt-6   border border-amber-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">
                    Assign Analyst
                  </h3>

                  <input
                    type="text"
                    value={assignAdminUserId}
                    onChange={(e) => setAssignAdminUserId(e.target.value)}
                    placeholder="Analyst admin user ID"
                    className="mt-4 w-full   border border-slate-300 px-4 py-3"
                  />

                  <textarea
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Assignment notes"
                    rows={3}
                    className="mt-3 w-full   border border-slate-300 px-4 py-3 resize-none"
                  />

                  <button
                    onClick={handleAssignSession}
                    disabled={assigningCase || !assignAdminUserId.trim()}
                    className="mt-4   bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {assigningCase ? "Assigning..." : "Assign Case"}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isUnassigned && !canViewFullCase && (
            <div className="  border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Investigation In Progress
              </h2>
              <p className="mt-2 text-slate-600">
                This case is currently assigned to another fraud analyst.
              </p>
              <div className="mt-6   border border-slate-200 bg-white p-5">
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
            <>
              {isLiveSession && (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8 space-y-6">
                    <EvidencePanel session={session} />
                    <InvestigationPanel session={session} />
                    <Timeline session={session} />
                  </div>

                  <div className="col-span-4 space-y-6">
                    <div className="  border border-red-200 bg-red-50 p-6">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                        </span>

                        <h2 className="text-lg font-semibold text-red-900">
                          Live Duress Response
                        </h2>
                      </div>

                      <p className="mt-3 text-sm text-red-700">
                        Prioritise location monitoring, alerts, emergency
                        notifications and account protection.
                      </p>
                    </div>

                    <CaseManagement
                      session={session}
                      freezingAccounts={freezingAccounts}
                      handleFreezeAccounts={handleFreezeAccounts}
                      dispatchingNotifications={dispatchingNotifications}
                      handleDispatchNotifications={handleDispatchNotifications}
                      canFreezeAccounts={canFreezeAccounts}
                      canDispatchNotifications={canDispatchNotifications}
                    />
                    {canSubmitCaseReport && (
                      <CaseReportForm
                        session={session}
                        onSubmitted={setSession}
                      />
                    )}
                  </div>
                </div>
              )}

              {isPostIncidentSession && (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8 space-y-6">
                    <InvestigationPanel session={session} />
                    <EvidencePanel session={session} />
                    <Timeline session={session} />
                  </div>

                  <div className="col-span-4 space-y-6">
                    {canSubmitCaseReport && (
                      <CaseReportForm
                        session={session}
                        onSubmitted={setSession}
                      />
                    )}

                    {canManagerReview && (
                      <ManagerReviewForm
                        session={session}
                        onReviewed={setSession}
                      />
                    )}

                    {session.managerReviewStatus === "Approved" && (
                      <div className="bg-white   border border-green-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-green-800">
                          Case Resolved
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                          {session.resolutionSummary}
                        </p>

                        {session.managerReviewedAt && (
                          <p className="mt-4 text-xs text-slate-500">
                            Approved{" "}
                            {new Date(
                              session.managerReviewedAt,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
