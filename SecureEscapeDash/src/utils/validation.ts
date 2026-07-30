export const CASE_STATUSES = [
  "Open",
  "Investigating",
  "Resolved",
  "FalseAlarm",
] as const;

export const ACTION_TYPES = [
  "Viewed",
  "Assigned",
  "CalledUser",
  "FrozeAccount",
  "ContactedAuthorities",
  "MarkedFalseAlarm",
  "Resolved",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NOTES_LENGTH = 500;

export function validateEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) return "Email address is required.";
  if (!EMAIL_PATTERN.test(trimmedEmail)) return "Enter a valid email address.";

  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";

  return "";
}

export function validateCaseStatus(caseStatus: string): string {
  if (!caseStatus) return "Select a case status.";
  if (!CASE_STATUSES.includes(caseStatus as (typeof CASE_STATUSES)[number])) {
    return "Select a valid case status.";
  }

  return "";
}

export function validateActionType(actionType: string): string {
  if (!actionType) return "Select an action type.";
  if (!ACTION_TYPES.includes(actionType as (typeof ACTION_TYPES)[number])) {
    return "Select a valid action type.";
  }

  return "";
}

export function validateOptionalNotes(notes: string): string {
  if (notes.length > MAX_NOTES_LENGTH) {
    return `Notes must be ${MAX_NOTES_LENGTH} characters or less.`;
  }

  return "";
}

export function cleanText(value: string): string {
  return value.trim();
}
