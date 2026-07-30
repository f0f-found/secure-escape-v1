export type DecoyProfileResponse = {
  id: string;
  userId: string;
  profileType: "LowProfile" | "Custom" | "PartialFreeze" | "InsiderThreat";
  displayBalance: number;
  emergencyBudget: number;
  tier1Limit: number;
  tier2Limit: number;
  tier2DelayHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type UpsertDecoyProfileRequest = {
  profileType: "LowProfile" | "Custom" | "PartialFreeze" | "InsiderThreat";
  displayBalance: number;
  emergencyBudget: number;
  tier1Limit: number;
  tier2Limit: number;
  tier2DelayHours: number;
};

export type SetDuressPinRequest = {
  currentPin: string;
  duressPin: string;
};
