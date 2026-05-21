import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import {
  AddEmergencyContactRequest,
  EmergencyContactResponse,
} from "@/types/emergencyContact";

async function getAuthorizedHeaders() {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found. Please log in again.");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getEmergencyContacts(): Promise<
  EmergencyContactResponse[]
> {
  const response = await fetch(`${API_BASE_URL}/api/v1/emergency-contacts`, {
    method: "GET",
    headers: await getAuthorizedHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load emergency contacts.");
  }

  return response.json();
}

export async function addEmergencyContact(
  request: AddEmergencyContactRequest,
): Promise<EmergencyContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/emergency-contacts`, {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add emergency contact.");
  }

  return response.json();
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/emergency-contacts/${id}`,
    {
      method: "DELETE",
      headers: await getAuthorizedHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete emergency contact.");
  }
}
