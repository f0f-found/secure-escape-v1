import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import { ProfileMeResponse } from "@/types/profile";

export async function getProfileMe(): Promise<ProfileMeResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/Profile/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load profile.");
  }

  return response.json();
}
