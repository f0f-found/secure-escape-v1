// services/biometricAuthService.ts
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_FLAG = "secureescape.biometric.enabled";
const BIOMETRIC_SESSION_KEY = "secureescape.biometric.session";

export type StoredSession = {
  token: string;
  sessionMode: string;
  userSessionId: string;
  userId: string;
};

/**
 * Call this right after a successful PIN login, only if the user has the
 * "Biometrics" switch on. Stores the whole session behind Face ID/Touch ID,
 * plus a plain (unprotected) flag so the login screen can check "is this
 * available on this device" without triggering a prompt just to find out.
 */
export async function enableBiometricLogin(
  session: StoredSession,
): Promise<void> {
  await SecureStore.setItemAsync(
    BIOMETRIC_SESSION_KEY,
    JSON.stringify(session),
    {
      requireAuthentication: true,
    },
  );
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_FLAG, "true");
}

export async function disableBiometricLogin(): Promise<void> {
  await SecureStore.deleteItemAsync(BIOMETRIC_SESSION_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_FLAG).catch(() => {});
}

/**
 * Safe to call on every screen mount — reads only the plain flag, never
 * touches the protected entry, so it never prompts Face ID by itself.
 */
export async function isBiometricLoginAvailable(): Promise<{
  available: boolean;
  label: "Face ID" | "Touch ID" | "Biometric" | null;
}> {
  const previouslyEnabled = await SecureStore.getItemAsync(
    BIOMETRIC_ENABLED_FLAG,
  );
  if (!previouslyEnabled) return { available: false, label: null };

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) return { available: false, label: null };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const label = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  )
    ? "Face ID"
    : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ? "Touch ID"
      : "Biometric";

  return { available: true, label };
}

/**
 * Triggers the native prompt. Returns the stored session on success so the
 * caller can restore it via saveAuthSession — no backend call needed, this
 * is purely unlocking a session that a real PIN login already produced.
 * Returns null on cancel/failure/no-stored-session; caller should just fall
 * back to the PIN form silently, no error dialog.
 */
export async function loginWithBiometrics(): Promise<StoredSession | null> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Log in to SecureEscape",
    cancelLabel: "Use PIN instead",
  });

  if (!result.success) return null;

  const raw = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}
