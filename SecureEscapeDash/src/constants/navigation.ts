export type NavItem = {
  label: string;
  path: string;
};

export const navigation = {
  FraudAnalyst: [
    { label: "Dashboard", path: "/analyst" },
    { label: "My Cases", path: "/analyst/cases" },
    { label: "Search Cases", path: "/analyst/search" },
  ],

  FraudManager: [
    { label: "Dashboard", path: "/manager" },
    { label: "Team Cases", path: "/manager/cases" },
    { label: "Assignments", path: "/manager/assignments" },
    { label: "Reports", path: "/manager/reports" },
  ],

  SecureEscapeAdmin: [
    { label: "Dashboard", path: "/admin" },
    { label: "Audit Logs", path: "/admin/audit" },
    { label: "Users", path: "/admin/users" },
  ],
} satisfies Record<string, NavItem[]>;
