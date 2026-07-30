export const ADMIN_ROLES = {
  FraudAnalyst: "FraudAnalyst",
  FraudManager: "FraudManager",
  SecureEscapeAdmin: "SecureEscapeAdmin",
  SystemAdmin: "SystemAdmin",
} as const;

export type AdminRole = keyof typeof ADMIN_ROLES;

export const ROLE_LABELS: Record<AdminRole, string> = {
  FraudAnalyst: "Fraud Analyst",
  FraudManager: "Fraud Manager",
  SecureEscapeAdmin: "Secure Escape Admin",
  SystemAdmin: "System Admin",
};
