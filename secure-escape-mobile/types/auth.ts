export type LoginRequest = {
  email: string;
  password: string;
  pin: string;
  deviceInfo?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
};

export type LoginResponse = {
  userId: string;
  userSessionId: string;
  fullName: string;
  email: string;
  token: string;
  sessionMode: "Normal" | "Duress";
  isDuress: boolean;
};
