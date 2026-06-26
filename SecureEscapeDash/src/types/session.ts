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
  alertCount: number;
  highestSeverity: string;
  alertTypes: string[];
};

export type SessionAlertLog = {
  id: string;
  type: string;
  severity: string;
  description: string;
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
  alerts: SessionAlertLog[];
  transactions: AlertTransaction[];
  locations: AlertLocation[];
  actions: AlertAction[];
};
