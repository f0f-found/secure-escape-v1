import { API_BASE_URL } from "../constants/api";
import type { DuressSessionSummary } from "../types/session";
import { getToken } from "../utils/tokenStore";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getDuressSessions(): Promise<DuressSessionSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/duress-sessions`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load duress sessions.");
  return response.json();
}
