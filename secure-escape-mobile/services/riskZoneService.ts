import { API_BASE_URL } from "@/constants/api";
import { getAuthorizedHeaders } from "./transactionServices";

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

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
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

export async function getRiskZones(): Promise<RiskZone[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/risk-zones`, {
    method: "GET",
    headers: await getAuthorizedHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load area safety information."),
    );
  }

  return response.json();
}