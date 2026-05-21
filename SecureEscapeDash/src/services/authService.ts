import { API_BASE_URL } from "../constants/api";
import type { AdminLoginRequest, AdminLoginResponse } from "../types/auth";

export async function adminLogin(
  request: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json();
}
