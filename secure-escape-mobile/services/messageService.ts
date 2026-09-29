import { API_BASE_URL } from "@/constants/api";
import { getAuthorizedHeaders } from "./transactionServices";

export type UserMessage = {
  id: string;
  title: string;
  body: string;
  category: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type CreateUserMessageRequest = {
  title: string;
  body: string;
  category: string;
  referenceType?: string | null;
  referenceId?: string | null;
  deduplicationKey?: string | null;
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

export async function getMessages(): Promise<UserMessage[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/messages`, {
    method: "GET",
    headers: await getAuthorizedHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load your messages."),
    );
  }

  return response.json();
}

export async function createMessage(
  request: CreateUserMessageRequest,
): Promise<UserMessage> {
  const authorizedHeaders = await getAuthorizedHeaders();

  const response = await fetch(`${API_BASE_URL}/api/v1/messages`, {
    method: "POST",
    headers: {
      ...authorizedHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to save the message."),
    );
  }

  return response.json();
}

export async function markMessageAsRead(
  id: string,
): Promise<UserMessage> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/messages/${id}/read`,
    {
      method: "PATCH",
      headers: await getAuthorizedHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to update the message."),
    );
  }

  return response.json();
}