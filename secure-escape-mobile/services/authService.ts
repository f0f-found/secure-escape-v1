import { API_BASE_URL } from "@/constants/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import { clearAuthToken, getAuthToken, setLastActivityNow } from "./tokenStore";

async function getErrorMessage(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const errorBody = JSON.parse(text);

    if (typeof errorBody.message === "string") {
      return errorBody.message;
    }

    if (errorBody.errors) {
      return Object.values(errorBody.errors).flat().join("\n");
    }

    if (typeof errorBody.title === "string") {
      return errorBody.title;
    }
  } catch {
    return text;
  }

  return fallback;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Login failed. Please check your details and try again.",
      ),
    );
  }
  await setLastActivityNow();
  return response.json();
}

export async function logout(): Promise<void> {
  const token = await getAuthToken();

  if (token) {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {}); // silent fail — we clear locally regardless
  }

  await clearAuthToken();
}
