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

async function getErrorMessage(response: Response, fallback: string) {
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

export async function createTransfer(
  request: CreateTransferRequest,
): Promise<TransactionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create transfer."));
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
    throw new Error(
      await getErrorMessage(response, "Failed to create cash send."),
    );
  }

  return response.json();
}
