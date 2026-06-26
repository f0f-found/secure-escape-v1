import { API_BASE_URL } from "../constants/api";
import type {
  DuressSessionSummary,
  DuressSessionDetail,
} from "../types/session";
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

export async function getDuressSessionById(
  id: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}`,
    { headers: getHeaders() },
  );
  if (!response.ok) throw new Error("Failed to load session.");
  return response.json();
}

export async function updateCaseStatus(
  id: string,
  caseStatus: string,
  notes: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/case-status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ caseStatus, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to update case status.");
}

export async function addCaseAction(
  id: string,
  actionType: string,
  notes: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/actions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ actionType, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to add action.");
}
