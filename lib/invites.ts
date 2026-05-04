/**
 * E.164 phone number — '+' followed by 8–15 digits, first digit non-zero.
 * Source of truth for all phone validation in the app.
 */
const E164 = /^\+[1-9]\d{7,14}$/;

export function isValidE164(phone: string): boolean {
  return E164.test(phone);
}

/**
 * Normalize a user-entered phone string to E.164. Returns null if not parseable.
 * Strips spaces, dashes, parentheses; keeps a leading '+'.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const stripped = trimmed.replace(/[^\d+]/g, "");
  if (!stripped) return null;
  // If user wrote without '+', assume they meant a leading '+'.
  const candidate = stripped.startsWith("+") ? stripped : `+${stripped}`;
  return isValidE164(candidate) ? candidate : null;
}

export const INVITES_REQUIRED = 2;
