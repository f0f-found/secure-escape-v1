import { ADMIN_ROLES, type AdminRole } from "./roles";

export type NavItem = {
  label: string;
  path: string;
};

export const navigation: Record<AdminRole, NavItem[]> = {
  [ADMIN_ROLES.FraudAnalyst]: [
    { label: "Dashboard", path: "/analyst" },
    { label: "Search Cases", path: "/analyst/search" },
  ],

  [ADMIN_ROLES.FraudManager]: [
    { label: "Dashboard", path: "/manager" },
    { label: "Resolved Cases", path: "/manager/resolved" },
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