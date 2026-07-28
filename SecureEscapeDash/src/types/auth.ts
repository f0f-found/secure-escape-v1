export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  adminUserId: string;
  fullName: string;
  email: string;
  adminRole: string;
  bankName: string;
  token: string;
};

export type AdminUserSummary = {
  id: string;
  fullName: string;
  email: string;
};