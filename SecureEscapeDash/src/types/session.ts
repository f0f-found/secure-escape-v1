import type {
  AlertAction,
  AlertLocation,
  AlertTransaction,
  NotificationAttempt,
} from "./alert";

export type DuressSessionSummary = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  caseStatus: string;
  managerReviewStatus: string;
  lastAlertAt: string | null;
  alertCount: number;
  highestSeverity: string;
  alertTypes: string[];
  assignedAdminUserId?: string;
  assignedAdminName?: string;
  assignedAt?: string;
};

export type SessionAlertLog = {
  id: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  resolvedAt: string | null;
  createdAt: string;
  notificationAttempts: NotificationAttempt[];
};

export type DuressSessionDetail = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  mode: string;
  status: string;
  caseStatus: string;
  ipAddress: string;
  deviceInfo: string;
  startedAt: string;
  endedAt: string | null;
  caseResolvedAt: string | null;
  investigationSummary: string;
  resolutionSummary: string;
  resolvedByAdminUserId?: string;
  resolutionSubmittedAt: string | null;
  managerReviewStatus: string;
  managerReviewedByAdminUserId?: string;
  managerReviewedAt: string | null;
  managerReviewNotes: string;
  alertCount: number;
  transactionCount: number;
  locationCount: number;
  notificationAttemptCount: number;
  highestSeverity: string;
  lastLocationAt: string | null;
  lastAlertAt: string | null;
  accountsFrozen: boolean;
  alerts: SessionAlertLog[];
  transactions: AlertTransaction[];
  locations: AlertLocation[];
  actions: AlertAction[];
  assignedAdminUserId?: string;
  assignedAdminName?: string;
  assignedAt?: string;
};
