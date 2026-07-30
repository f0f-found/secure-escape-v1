import { ADMIN_ROLES, type AdminRole } from "./roles";

export type NavItem = {
  label: string;
  path: string;
};

export const navigation: Record<AdminRole, NavItem[]> = {
  [ADMIN_ROLES.FraudAnalyst]: [
    { label: "Dashboard", path: "/analyst" },
    { label: "Open Cases", path: "/analyst/open-cases" },
    { label: "My Cases", path: "/analyst/cases" },
    { label: "Search Cases", path: "/analyst/search" },
  ],

  [ADMIN_ROLES.FraudManager]: [
    { label: "Dashboard", path: "/manager" },
    { label: "Case Assignments", path: "/manager/assignments" },
    { label: "Resolved Reviews", path: "/manager/resolved" },
    { label: "Reports", path: "/manager/reports" },
  ],

  [ADMIN_ROLES.SecureEscapeAdmin]: [
    { label: "Dashboard", path: "/admin" },
    { label: "Bank Stats", path: "/admin/banks" },
    { label: "Audit Logs", path: "/admin/audit" },
    { label: "Users", path: "/admin/users" },
  ],

  [ADMIN_ROLES.SystemAdmin]: [
    { label: "Dashboard", path: "/admin" },
    { label: "Bank Stats", path: "/admin/banks" },
    { label: "Audit Logs", path: "/admin/audit" },
    { label: "Users", path: "/admin/users" },
    { label: "Manager View", path: "/manager" },
    { label: "Analyst View", path: "/analyst" },
  ],
};
