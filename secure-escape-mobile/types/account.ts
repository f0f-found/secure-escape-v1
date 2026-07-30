export type AccountResponse = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: "Cheque" | "Savings" | "Credit";
  availableBalance: number;
  currentBalance: number;
  currency: string;
  status: "Active" | "Frozen" | "Closed" | "Suspended";
  isDecoyView: boolean;
};
