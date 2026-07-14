/* eslint-disable no-useless-assignment */
import { API_BASE_URL } from "../constants/api";
import type {
  DuressSessionSummary,
  DuressSessionDetail,
} from "../types/session";
import { getToken } from "../utils/tokenStore";

async function handleError(response: Response, fallbackMessage: string) {
  let details = "";

  try {
    details = await response.text();
  } catch {
    details = "";
  }

  throw new Error(`${fallbackMessage} Status: ${response.status}. ${details}`);
}

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
  if (!response.ok) {
    await handleError(response, "Failed to load duress sessions.");
  }
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
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/case-status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ caseStatus, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to update case status.");
  return response.json();
}

export async function addCaseAction(
  id: string,
  actionType: string,
  notes: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/actions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ actionType, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to add action.");
  return response.json();
}

export async function freezeSessionAccounts(
  id: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/freeze-accounts`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );

  if (!response.ok) throw new Error("Failed to freeze accounts.");

  return response.json();
}

export async function dispatchSessionNotifications(
  id: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/dispatch-notifications`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );

  if (!response.ok)
    throw new Error("Failed to dispatch session notifications.");

  return response.json();
}
