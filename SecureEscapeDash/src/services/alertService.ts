import { API_BASE_URL } from "../constants/api";
import type { AlertDetail, AlertSummary } from "../types/alert";

import { getToken } from "../utils/tokenStore";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getAlerts(status?: string): Promise<AlertSummary[]> {
  const url = status
    ? `${API_BASE_URL}/api/v1/admin/alerts?status=${status}`
    : `${API_BASE_URL}/api/v1/admin/alerts`;

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) throw new Error("Failed to load alerts.");
  return response.json();
}

export async function getAlertById(id: string): Promise<AlertDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/alerts/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load alert.");
  return response.json();
}

export async function updateAlertStatus(
  id: string,
  status: string,
  notes: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/alerts/${id}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to update alert status.");
}

export async function addAlertAction(
  id: string,
  actionType: string,
  notes: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/alerts/${id}/actions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ actionType, notes }),
    },
  );
  if (!response.ok) throw new Error("Failed to add action.");
}
