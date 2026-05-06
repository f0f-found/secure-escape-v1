import { API_BASE_URL } from "@/constants/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Login failed. Please check your details and try again.",
    );
  }

  return response.json();
}
