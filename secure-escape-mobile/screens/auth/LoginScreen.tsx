import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
} from "react-native";
import { colors } from "@/utils/theme";
import { login } from "@/services/authService";
import { saveAuthSession } from "@/services/tokenStore";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Platform } from "react-native";

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
    } else if (pin.length < 4) {
      return "Please enter at least 4 digits for your app PIN.";
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

  const handleSubmit = async () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      showError(validationMessage);
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
      showError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          Global<Text style={styles.logoO}>O</Text>ne
        </Text>
      </View>

      <View style={styles.pinArea}>
        <View style={styles.pinLabelRow}>
          <Text>Email</Text>
        </View>

        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearError();
          }}
        />



        <View style={styles.pinLabelRow}>
          <Text>Enter app PIN</Text>
          {/* <Text style={styles.forgotPin}>Forgot PIN</Text> */}
        </View>

        <TextInput
          style={styles.pinInput}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={pin}
          onChangeText={(value) => {
            setPin(value);
            clearError();
          }}
        />

        {error && (
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
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Signing in..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.biometricsSection}>
        <View style={styles.biometricsRow}>
          <View>
            <Text style={{ fontWeight: "bold" }}>Biometrics</Text>
            <Text style={{ fontSize: 12, color: colors.textSub }}>
              Sign in with fingerprint or facial recognition
            </Text>
          </View>

          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: "#ccc", true: colors.primary }}
          />
        </View>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 36,
  },
  backArrow: { fontSize: 20, color: "#555" },
  pill: { width: 130, height: 5, backgroundColor: "#ccc", borderRadius: 10 },
  logoContainer: { alignItems: "center", marginTop: 36 },
  logoText: { fontSize: 42, fontWeight: "800", color: colors.navy },
  logoO: {
    borderWidth: 4,
    borderColor: colors.gradientEnd,
    borderRadius: 38,
    width: 38,
    height: 38,
    textAlign: "center",
    lineHeight: 34,
    marginHorizontal: 2,
  },
  pinArea: { padding: 24 },
  pinLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  forgotPin: { color: colors.gradientEnd, textDecorationLine: "underline" },
  pinInput: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 12,
    padding: 12,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
  },
  submitText: { color: colors.white, fontWeight: "700" },
  biometricsSection: {
    margin: 16,
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
  },
  biometricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dontShowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
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
