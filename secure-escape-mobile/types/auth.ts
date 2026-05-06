export type LoginRequest = {
  email: string;
  password: string;
  pin: string;
};

export type LoginResponse = {
  id: string;
  fullName: string;
  email: string;
  token: string;
  isUnderDuress: boolean;
};
