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
