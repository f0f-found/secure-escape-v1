/* eslint-disable no-useless-assignment */
import { API_BASE_URL } from "../constants/api";
import type { AdminUserSummary } from "../types/auth";
import type {
  DuressSessionSummary,
  DuressSessionDetail,
} from "../types/session";
import { getToken } from "../utils/tokenStore";
import {
  cleanText,
  validateActionType,
  validateCaseStatus,
  validateOptionalNotes,
} from "../utils/validation";

export interface SessionEvidenceItem {
  id: string;
  userSessionId: string;
  bankTransactionId: string | null;
  evidenceType: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  capturedAt: string;
  createdAt: string;
}

async function handleError(
  response: Response,
  fallbackMessage: string,
) {
  let details = "";

  try {
    details = await response.text();
  } catch {
    details = "";
  }

  throw new Error(
    `${fallbackMessage} Status: ${response.status}. ${details}`,
  );
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function getEvidenceHeaders() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getDuressSessions(): Promise<
  DuressSessionSummary[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    await handleError(
      response,
      "Failed to load duress sessions.",
    );
  }

  return response.json();
}

export async function getDuressSessionById(
  id: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load session.");
  }

  return response.json();
}

export async function getSessionEvidence(
  sessionId: string,
): Promise<SessionEvidenceItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${sessionId}/evidence`,
    {
      headers: getEvidenceHeaders(),
    },
  );

  if (!response.ok) {
    await handleError(
      response,
      "Failed to load session evidence.",
    );
  }

  return response.json();
}

export async function getSessionEvidenceFile(
  sessionId: string,
  evidenceId: string,
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${sessionId}/evidence/${evidenceId}/file`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    await handleError(
      response,
      "Failed to load evidence file.",
    );
  }

  const blob = await response.blob();

  return URL.createObjectURL(blob);
}

export async function updateCaseStatus(
  id: string,
  caseStatus: string,
  notes: string,
): Promise<DuressSessionDetail> {
  const cleanedNotes = cleanText(notes);

  const validationError =
    validateCaseStatus(caseStatus) ||
    validateOptionalNotes(cleanedNotes);

  if (validationError) {
    throw new Error(validationError);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/case-status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        caseStatus,
        notes: cleanedNotes,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update case status.");
  }

  return response.json();
}

export async function addCaseAction(
  id: string,
  actionType: string,
  notes: string,
): Promise<DuressSessionDetail> {
  const cleanedNotes = cleanText(notes);

  const validationError =
    validateActionType(actionType) ||
    validateOptionalNotes(cleanedNotes);

  if (validationError) {
    throw new Error(validationError);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/actions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        actionType,
        notes: cleanedNotes,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to add action.");
  }

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

  if (!response.ok) {
    throw new Error("Failed to freeze accounts.");
  }

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

  if (!response.ok) {
    throw new Error(
      "Failed to dispatch session notifications.",
    );
  }

  return response.json();
}

export async function assignCase(
  id: string,
  adminUserId: string,
  notes: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/assign`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        adminUserId,
        notes: cleanText(notes),
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to assign case.");
  }

  return response.json();
}

export async function submitCaseReport(
  id: string,
  investigationSummary: string,
  resolutionSummary: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/case-report`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        investigationSummary:
          cleanText(investigationSummary),
        resolutionSummary:
          cleanText(resolutionSummary),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to submit case report.",
    );
  }

  return response.json();
}

export async function managerReviewCase(
  id: string,
  reviewStatus: "Approved" | "Rejected",
  reviewNotes: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/manager-review`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        reviewStatus,
        reviewNotes: cleanText(reviewNotes),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to submit manager review.",
    );
  }

  return response.json();
}

export async function getAnalysts(): Promise<
  AdminUserSummary[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/users/analysts`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load analysts.");
  }

  return response.json();
}

export async function claimSession(
  id: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/claim`,
    {
      method: "PATCH",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to claim session.");
  }

  return response.json();
}

export async function assignSession(
  id: string,
  adminUserId: string,
  notes: string,
): Promise<DuressSessionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/duress-sessions/${id}/assign`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        adminUserId,
        notes,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to assign session.");
  }

  return response.json();
}