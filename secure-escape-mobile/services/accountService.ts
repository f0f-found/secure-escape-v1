import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import { AccountResponse } from "@/types/account";

export async function getAccounts(): Promise<AccountResponse[]> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/accounts`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load accounts.");
  }

  return response.json();
}

export async function getAccountById(
  accountId: string,
): Promise<AccountResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/accounts/${accountId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load account.");
  }

  return response.json();
}
