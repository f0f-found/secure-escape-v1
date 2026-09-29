import { API_BASE_URL } from "../constants/api";
import { getToken } from "../utils/tokenStore";

export type RiskLevel = "High" | "Medium" | "Low";

export type RiskZone = {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  riskScore: number;
  incidentCount: number;
  duressEventCount: number;
  description: string | null;
};

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getRiskZones(): Promise<RiskZone[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/risk-zones`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load area risk information.");
  }

  return response.json();
}