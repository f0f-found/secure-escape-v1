export type ProfileMeResponse = {
  id: string;
  bankIntegrationId: string;
  bankCustomerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  userSessionId: string;
  sessionMode: "Normal" | "Duress";
};
