import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/services/tokenStore";
import {
  CashSendResponse,
  CreateCashSendRequest,
  CreateTransferRequest,
  TransactionResponse,
} from "@/types/transaction";

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

export async function createTransfer(
  request: CreateTransferRequest,
): Promise<TransactionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create transfer.");
  }

  return response.json();
}

export async function createCashSend(
  request: CreateCashSendRequest,
): Promise<CashSendResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/transactions/cash-send`,
    {
      method: "POST",
      headers: await getAuthorizedHeaders(),
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create cash send.");
  }

  return response.json();
}
