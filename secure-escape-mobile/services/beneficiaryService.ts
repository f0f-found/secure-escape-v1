import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import {
  AddBeneficiaryRequest,
  BeneficiaryResponse,
} from "@/types/beneficiary";

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

export async function getBeneficiaries(): Promise<BeneficiaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/beneficiaries`, {
    method: "GET",
    headers: await getAuthorizedHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load beneficiaries.");
  }

  return response.json();
}

export async function addBeneficiary(
  request: AddBeneficiaryRequest,
): Promise<BeneficiaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/beneficiaries`, {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add beneficiary.");
  }

  return response.json();
}

export async function deleteBeneficiary(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/beneficiaries/${id}`, {
    method: "DELETE",
    headers: await getAuthorizedHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete beneficiary.");
  }
}
