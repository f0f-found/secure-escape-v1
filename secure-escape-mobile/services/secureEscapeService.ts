import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import {
  DecoyProfileResponse,
  SetDuressPinRequest,
  UpsertDecoyProfileRequest,
} from "@/types/secureEscape";

async function getAuthorizedHeaders() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

export async function getActiveDecoyProfile(): Promise<DecoyProfileResponse | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/secure-escape/decoy-profile`,
    {
      method: "GET",
      headers: await getAuthorizedHeaders(),
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load Secure Escape setup."),
    );
  }

  return response.json();
}

export async function upsertDecoyProfile(
  request: UpsertDecoyProfileRequest,
): Promise<DecoyProfileResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/secure-escape/decoy-profile`,
    {
      method: "PUT",
      headers: await getAuthorizedHeaders(),
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to save Secure Escape setup."),
    );
  }

  return response.json();
}

export async function setDuressPin(
  request: SetDuressPinRequest,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/secure-escape/duress-pin`,
    {
      method: "POST",
      headers: await getAuthorizedHeaders(),
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to update duress PIN."),
    );
  }

  return response.json();
}
