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
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/utils/theme";
import { login } from "@/services/authService";
import { saveAuthSession } from "@/services/tokenStore";
import * as Location from "expo-location";
import Constants from "expo-constants";

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

  // Field-level error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

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

    if (!email.trim()) {
      missingFields.push("email");
    }

    if (!pin.trim()) {
      missingFields.push("PIN");
    } else if (pin.length !== 4) {
      return "Please enter exactly 4 digits for your app PIN.";
    }

    if (missingFields.length === 0) {
      return null;
    }

    if (missingFields.length === 1) {
      return `Please enter your ${missingFields[0]}.`;
    }

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

  // ----- Improved error handling -----
  const getFriendlyErrorMessage = (error: unknown): string => {
    if (!error) return "An unexpected error occurred. Please try again.";

    // If it's a string, we can try to match common patterns
    if (typeof error === "string") {
      const lower = error.toLowerCase();
      if (lower.includes("network") || lower.includes("connection") || lower.includes("timeout")) {
        return "Network error. Please check your connection.";
      }
      if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("incorrect")) {
        return "Invalid email or PIN. Please try again.";
      }
      if (lower.includes("server") || lower.includes("internal") || lower.includes("500")) {
        return "Something went wrong. Please try again later.";
      }
      // If it's a known backend message, we can still return a generic one
      return "Unable to sign in. Please try again.";
    }

    // If it's an Error object
    if (error instanceof Error) {
      const message = error.message;
      const lower = message.toLowerCase();
      if (lower.includes("network") || lower.includes("connection") || lower.includes("timeout")) {
        return "Network error. Please check your connection.";
      }
      if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("incorrect")) {
        return "Invalid email or PIN. Please try again.";
      }
      if (lower.includes("server") || lower.includes("internal") || lower.includes("500")) {
        return "Something went wrong. Please try again later.";
      }
      // For any other Error, return a generic but polite message
      return "Unable to sign in. Please try again.";
    }

    return "An unexpected error occurred. Please try again.";
  };

  const handleSubmit = async () => {
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
      const response = await login({
        email,
        pin,
        ...loginContext,
      });

      await saveAuthSession({
        token: response.token,
        sessionMode: response.sessionMode,
        userSessionId: response.userSessionId,
        userId: response.userId,
      });

      onLoginSuccess?.();
    } catch (error) {
      // Use our friendly error mapper
      const friendlyMessage = getFriendlyErrorMessage(error);
      showError(friendlyMessage);
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

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePinBlur = () => {
    validatePin(pin);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      const trimmed = value.trim();
      if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailError(null);
      } else if (!trimmed) {
        setEmailError("Email is required.");
      }
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPin(numericValue);
    if (pinError) {
      if (numericValue.length === 4) {
        setPinError(null);
      } else if (numericValue.length === 0) {
        setPinError("PIN is required.");
      } else {
        setPinError("PIN must be exactly 4 digits.");
      }
    }
  };

  const isFormValid = () => {
    const trimmedEmail = email.trim();
    const trimmedPin = pin.trim();
    const emailValid = trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const pinValid = trimmedPin && /^\d{4}$/.test(trimmedPin);
    return emailValid && pinValid;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <View style={{ width: 24 }} />
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          Global
          <Text style={styles.logoO}>O</Text>
          ne
        </Text>
      </View>

      <View style={styles.pinArea}>
        {/* Email field */}
        <View style={styles.pinLabelRow}>
          <Text style={styles.pinLabel}>Email <Text style={styles.required}></Text></Text>
        </View>
        <TextInput
          style={[styles.textInput, emailError && styles.inputError]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          onBlur={handleEmailBlur}
          placeholder="Enter your email"
          placeholderTextColor="#ccc"
          maxLength={40}
        />
        {emailError && <Text style={styles.fieldError}>{emailError}</Text>}

        {/* PIN field */}
        <View style={[styles.pinLabelRow, { marginTop: 16 }]}>
          <Text style={styles.pinLabel}>Enter app PIN  <Text style={styles.required}></Text></Text>
          <TouchableOpacity>
            <Text style={styles.forgotPin}>Forgot PIN</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.pinInput, pinError && styles.inputError]}
          secureTextEntry
          maxLength={4}
          keyboardType="numeric"
          value={pin}
          onChangeText={handlePinChange}
          onBlur={handlePinBlur}
          placeholder="• • • •"
          placeholderTextColor="#ccc"
        />
        {pinError && <Text style={styles.fieldError}>{pinError}</Text>}

        {/* Error banner */}
        {error && !emailError && !pinError && (
          <TouchableOpacity
            style={styles.errorBanner}
            activeOpacity={0.8}
            onPress={() => setShowErrorModal(true)}
          >
            <Text style={styles.errorIcon}>!</Text>
            <Text style={styles.errorBannerText}>{error}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          <LinearGradient
            colors={["#7C6EF7", "#4A6CF7"]}
            style={styles.gradientButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.biometricsSection}>
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
            trackColor={{ false: colors.greyLine, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <TouchableOpacity
          style={styles.dontShowRow}
          onPress={() => setDontShowAgain(!dontShowAgain)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}
          >
            {dontShowAgain && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.dontShowText}>
            Don&apos;t show me this again
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>!</Text>
            </View>
            <Text style={styles.modalTitle}>Could not sign in</Text>
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

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Styles remain unchanged (keep as they were)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 75,
    marginBottom: 20,
  },
  logoContainer: { alignItems: "center", marginTop: 20, marginBottom: 40 },
  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -1,
  },
  logoO: {
    borderWidth: 4,
    borderColor: colors.gradientEnd,
    borderRadius: 38,
    width: 42,
    height: 42,
    textAlign: "center",
    lineHeight: 36,
    marginHorizontal: 2,
    fontSize: 36,
    fontWeight: "800",
    color: colors.navy,
  },
  pinArea: { paddingHorizontal: 24, marginBottom: 30 },
  pinLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pinLabel: { fontSize: 14, color: colors.textSub },
  required: { color: "#DC2626", fontWeight: "700" },
  forgotPin: {
    fontSize: 13,
    color: colors.gradientEnd,
    textDecorationLine: "underline",
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 4,
  },
  pinInput: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 16,
    padding: 14,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 4,
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  fieldError: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 8,
  },
  submitButton: { marginTop: 28, borderRadius: 50, overflow: "hidden" },
  gradientButton: { paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },
  disabledButton: { opacity: 0.6 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    color: "#fff",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "900",
  },
  errorBannerText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  biometricsSection: {
    marginHorizontal: 20,
    backgroundColor: "#F8F9FC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.greyLine,
    marginTop: 10,
  },
  biometricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  biometricsText: { flex: 1, marginRight: 12 },
  biometricsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 4,
  },
  biometricsSubtitle: { fontSize: 13, color: colors.textSub, lineHeight: 18 },
  dontShowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.greyLine,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  dontShowText: { fontSize: 13, color: colors.textSub },
  bottomSpacer: { height: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DC2626",
    color: "#fff",
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "900",
    fontSize: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },
  modalMessage: {
    marginTop: 8,
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});