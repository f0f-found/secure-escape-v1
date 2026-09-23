import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { colors } from "@/utils/theme";
import { login } from "@/services/authService";
import {
  getLastLoginEmail,
  saveAuthSession,
  setLastLoginEmail,
} from "@/services/tokenStore";
import * as Location from "expo-location";
import Constants from "expo-constants";
import {
  enableBiometricLogin,
  isBiometricLoginAvailable,
  loginWithBiometrics,
} from "@/services/biometricAuthService";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("thabo.nkosi@email.co.za");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [loginLocked, setLoginLocked] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricOption, setBiometricOption] = useState<{
    available: boolean;
    label: string | null;
  }>({ available: false, label: null });

  React.useEffect(() => {
    isBiometricLoginAvailable().then(setBiometricOption);
    getLastLoginEmail().then((lastEmail) => {
      if (lastEmail) setEmail(lastEmail);
    });
  }, []);

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const getValidationMessage = () => {
    const missingFields = [];
    if (!email.trim()) missingFields.push("email");
    if (!pin.trim()) {
      missingFields.push("PIN");
    } else if (pin.length !== 4) {
      return "Please enter exactly 4 digits for your app PIN.";
    }
    if (missingFields.length === 0) return null;
    if (missingFields.length === 1) return `Please enter your ${missingFields[0]}.`;
    const lastField = missingFields.pop();
    return `Please enter your ${missingFields.join(", ")} and ${lastField}.`;
  };

  const getLoginContext = async () => {
    let latitude: number | undefined;
    let longitude: number | undefined;
    let accuracyMeters: number | undefined;

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status === "granted") {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      accuracyMeters = position.coords.accuracy ?? undefined;
    }

    return {
      deviceInfo: `${Platform.OS} • ${Constants.deviceName ?? "Unknown device"} • Expo mobile app`,
      ipAddress: "",
      latitude,
      longitude,
      accuracyMeters,
    };
  };

  const getFriendlyErrorMessage = (error: unknown): string => {
    if (!error) return "An unexpected error occurred. Please try again.";

    const classify = (msg: string) => {
      const lower = msg.toLowerCase();
      if (lower.includes("network") || lower.includes("connection") || lower.includes("timeout"))
        return "Network error. Please check your connection.";
      if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("incorrect"))
        return "Invalid email or PIN. Please try again.";
      if (lower.includes("server") || lower.includes("internal") || lower.includes("500"))
        return "Something went wrong. Please try again later.";
      return null;
    };

    if (typeof error === "string") {
      return classify(error) ?? "Unable to sign in. Please try again.";
    }
    if (error instanceof Error) {
      return classify(error.message) ?? "Unable to sign in. Please try again.";
    }
    return "An unexpected error occurred. Please try again.";
  };

  const isInvalidLoginError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? "");
    const lower = message.toLowerCase();
    return lower.includes("invalid") || lower.includes("credentials") || lower.includes("incorrect");
  };

  const handleSubmit = async () => {
    if (loginLocked) return;

    const validationMessage = getValidationMessage();
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    if (emailError || pinError) {
      showError("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      const loginContext = await getLoginContext();
      const response = await login({ email, pin, ...loginContext });

      await saveAuthSession({
        token: response.token,
        sessionMode: response.sessionMode,
        userSessionId: response.userSessionId,
        userId: response.userId,
      });
      await setLastLoginEmail(email);

      if (biometricsEnabled) {
        await enableBiometricLogin({
          token: response.token,
          sessionMode: response.sessionMode,
          userSessionId: response.userSessionId,
          userId: response.userId,
        });
      }

      onLoginSuccess?.();
    } catch (err) {
      if (isInvalidLoginError(err)) {
        const nextAttempt = failedAttempts + 1;
        setFailedAttempts(nextAttempt);

        if (nextAttempt >= 3) {
          setLoginLocked(true);
          showError(
            "For your security, sign-in has been temporarily locked after three unsuccessful attempts. Please contact your bank for assistance."
          );
        } else {
          showError(getFriendlyErrorMessage(err));
        }
      } else {
        showError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePin = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setPinError("PIN is required.");
      return false;
    }
    if (!/^\d+$/.test(trimmed)) {
      setPinError("PIN must contain only digits.");
      return false;
    }
    if (trimmed.length !== 4) {
      setPinError("PIN must be exactly 4 digits.");
      return false;
    }
    setPinError(null);
    return true;
  };

  const handleEmailBlur = () => validateEmail(email);
  const handlePinBlur = () => validatePin(pin);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      const trimmed = value.trim();
      if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) setEmailError(null);
      else if (!trimmed) setEmailError("Email is required.");
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPin(numericValue);
    if (pinError) {
      if (numericValue.length === 4) setPinError(null);
      else if (numericValue.length === 0) setPinError("PIN is required.");
      else setPinError("PIN must be exactly 4 digits.");
    }
  };

  const isFormValid = () => {
    const trimmedEmail = email.trim();
    const trimmedPin = pin.trim();
    const emailValid = trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const pinValid = trimmedPin && /^\d{4}$/.test(trimmedPin);
    return Boolean(emailValid && pinValid);
  };

  const handleBiometricLogin = async () => {
    const session = await loginWithBiometrics();
    if (!session) return;
    await saveAuthSession(session);
    onLoginSuccess?.();
  };

  const canSubmit = isFormValid() && !isSubmitting;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brandBlock}>
          <Text style={styles.logoText}>
            Secure<Text style={styles.logoO}>E</Text>scape
          </Text>
          <Text style={styles.brandSubtitle}>Secure banking, simply.</Text>
        </View>

        {/* Biometric quick login (only when available) */}
        {biometricOption.available && (
          <TouchableOpacity
            style={styles.biometricLoginButton}
            onPress={handleBiometricLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.biometricLoginText}>
              Log in with {biometricOption.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Form */}
        <View style={styles.formArea}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={handleEmailChange}
              editable={!loginLocked}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              maxLength={40}
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Enter app PIN</Text>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.inlineLink}>Forgot PIN</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.pinInput, pinError ? styles.inputError : null]}
              secureTextEntry
              maxLength={4}
              keyboardType="numeric"
              value={pin}
              onChangeText={handlePinChange}
              editable={!loginLocked}
              onBlur={handlePinBlur}
              placeholder="4-digit PIN"
              placeholderTextColor="#9CA3AF"
            />
            {pinError ? <Text style={styles.fieldError}>{pinError}</Text> : null}
          </View>

          {/* Inline error banner */}
          {error && !emailError && !pinError ? (
            <TouchableOpacity
              style={styles.errorBanner}
              activeOpacity={0.85}
              onPress={() => setShowErrorModal(true)}
            >
              <View style={styles.errorBadge}>
                <Text style={styles.errorBadgeText}>!</Text>
              </View>
              <Text style={styles.errorBannerText}>{error}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || loginLocked}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Biometrics enrolment */}
        <View style={styles.biometricsCard}>
          <View style={styles.biometricsRow}>
            <View style={styles.biometricsText}>
              <Text style={styles.biometricsTitle}>Biometrics</Text>
              <Text style={styles.biometricsSubtitle}>
                Sign in and authenticate with fingerprint or facial recognition
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: "#D6D9E0", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setDontShowAgain(!dontShowAgain)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
              {dontShowAgain ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>Don&apos;t show me this again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error modal */}
      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIconText}>!</Text>
            </View>
            <Text style={styles.modalTitle}>
              {loginLocked ? "Sign-in temporarily locked" : "Could not sign in"}
            </Text>
            <Text style={styles.modalMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Design tokens used here — all values should be promoted to utils/theme    */
/*  Colours come from the existing `colors` import where possible.            */
/*  Spacing / radii / heights below are the shared scale for the whole app.   */
/* -------------------------------------------------------------------------- */

const T = {
  // spacing scale
  sp4: 4,
  sp8: 8,
  sp12: 12,
  sp16: 16,
  sp20: 20,
  sp24: 24,
  sp32: 32,
  sp40: 40,
  // radii — deliberately restrained
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  // control heights
  inputH: 52,
  buttonH: 52,
  // neutral surfaces
  surface: "#FFFFFF",
  surfaceMuted: "#F7F8FA",
  border: "#E4E6EC",
  borderStrong: "#D6D9E0",
  // text
  textPrimary: "#0F172A", // fallback if colors.navy is not the same tone
  textMuted: "#64748B",
  // states
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#991B1B",
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.surface },

  container: { flex: 1, backgroundColor: T.surface },
  scrollContent: {
    paddingHorizontal: T.sp24,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: T.sp40,
  },

  /* Brand */
  brandBlock: {
    alignItems: "center",
    marginBottom: T.sp32,
  },
  logoText: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.navy ?? T.textPrimary,
    letterSpacing: -0.5,
  },
  logoO: {
    color: colors.primary,
  },
  brandSubtitle: {
    marginTop: T.sp8,
    fontSize: 14,
    color: T.textMuted,
  },

  /* Form */
  formArea: {
    marginBottom: T.sp24,
  },
  field: {
    marginBottom: T.sp16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navy ?? T.textPrimary,
    marginBottom: T.sp8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: T.sp8,
  },
  inlineLink: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  input: {
    height: T.inputH,
    borderWidth: 1,
    borderColor: T.borderStrong,
    borderRadius: T.radiusMd,
    paddingHorizontal: T.sp16,
    fontSize: 15,
    color: colors.navy ?? T.textPrimary,
    backgroundColor: T.surface,
  },
  pinInput: {
    letterSpacing: 4,
    fontWeight: "600",
  },
  inputError: {
    borderColor: T.danger,
    borderWidth: 1.5,
  },
  fieldError: {
    marginTop: T.sp8,
    fontSize: 12,
    fontWeight: "500",
    color: T.danger,
  },

  /* Primary button — solid, flat, no gradient */
  primaryButton: {
    marginTop: T.sp8,
    height: T.buttonH,
    borderRadius: T.radiusMd,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /* Inline error banner */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp12,
    marginBottom: T.sp16,
    backgroundColor: T.dangerBg,
    borderWidth: 1,
    borderColor: T.dangerBorder,
    borderRadius: T.radiusMd,
    padding: T.sp12,
  },
  errorBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  errorBannerText: {
    flex: 1,
    color: T.dangerText,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  /* Biometrics enrolment card */
  biometricsCard: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radiusMd,
    padding: T.sp16,
    backgroundColor: T.surface,
  },
  biometricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: T.sp16,
  },
  biometricsText: { flex: 1, marginRight: T.sp12 },
  biometricsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy ?? T.textPrimary,
    marginBottom: T.sp4,
  },
  biometricsSubtitle: {
    fontSize: 13,
    color: T.textMuted,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: T.borderStrong,
    borderRadius: 4,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  checkboxLabel: {
    fontSize: 13,
    color: T.textMuted,
  },

  /* Biometric quick login (top) */
  biometricLoginButton: {
    marginBottom: T.sp24,
    height: T.buttonH,
    borderRadius: T.radiusMd,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.surface,
  },
  biometricLoginText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: T.sp24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    padding: T.sp24,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: T.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: T.sp16,
  },
  modalIconText: {
    color: T.danger,
    fontWeight: "900",
    fontSize: 22,
    lineHeight: 26,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy ?? T.textPrimary,
    textAlign: "center",
  },
  modalMessage: {
    marginTop: T.sp8,
    color: T.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  modalButton: {
    marginTop: T.sp24,
    width: "100%",
    height: 48,
    borderRadius: T.radiusMd,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});