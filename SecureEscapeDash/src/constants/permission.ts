import { ADMIN_ROLES, type AdminRole } from "./roles";

type Permission =
  | "viewAnalystDashboard"
  | "viewManagerDashboard"
  | "viewAdminDashboard"
  | "viewCaseOverview"
  | "viewAssignedCaseDetails"
  | "viewAnyCaseDetails"
  | "assignCases"
  | "reassignCases"
  | "updateCaseStatus"
  | "recordCaseAction"
  | "freezeAccounts"
  | "dispatchNotifications"
  | "submitResolutionWriteUp"
  | "approveResolvedCases"
  | "viewPlatformStats"
  | "viewAuditLogs"
  | "manageUsers"
  | "claimCases";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [ADMIN_ROLES.FraudAnalyst]: [
    "viewAnalystDashboard",
    "viewCaseOverview",
    "viewAssignedCaseDetails",
    "updateCaseStatus",
    "recordCaseAction",
    "dispatchNotifications",
    "submitResolutionWriteUp",
    "claimCases",
  ],

  [ADMIN_ROLES.FraudManager]: [
    "viewManagerDashboard",
    "viewCaseOverview",
    "viewAssignedCaseDetails",
    "viewAnyCaseDetails",
    "assignCases",
    "reassignCases",
    "updateCaseStatus",
    "recordCaseAction",
    "freezeAccounts",
    "dispatchNotifications",
    "approveResolvedCases",
  ],

  [ADMIN_ROLES.SecureEscapeAdmin]: [
    "viewAdminDashboard",
    "viewPlatformStats",
    "viewAuditLogs",
    "manageUsers",
  ],

  [ADMIN_ROLES.SystemAdmin]: [
    "viewAnalystDashboard",
    "viewManagerDashboard",
    "viewAdminDashboard",
    "viewCaseOverview",
    "viewAssignedCaseDetails",
    "viewAnyCaseDetails",
    "assignCases",
    "reassignCases",
    "updateCaseStatus",
    "recordCaseAction",
    "freezeAccounts",
    "dispatchNotifications",
    "submitResolutionWriteUp",
    "approveResolvedCases",
    "viewPlatformStats",
    "viewAuditLogs",
    "manageUsers",
  ],
};

export function hasPermission(
  role: string | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role as AdminRole];

  return permissions?.includes(permission) ?? false;
}
