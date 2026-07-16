import { API_BASE_URL } from "../constants/api";
import type { AdminLoginRequest, AdminLoginResponse } from "../types/auth";
import { cleanText, validateEmail, validatePassword } from "../utils/validation";

export async function adminLogin(
  request: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  const email = cleanText(request.email);
  const validationError = validateEmail(email) || validatePassword(request.password);

  if (validationError) {
    throw new Error(validationError);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: request.password,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json();
}
