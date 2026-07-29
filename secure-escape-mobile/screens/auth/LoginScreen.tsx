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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

  return React.createElement(
    ScrollView,
    {
      style: styles.container,
      contentContainerStyle: styles.scrollContent,
      showsVerticalScrollIndicator: false,
      keyboardShouldPersistTaps: "handled",
    },
    React.createElement(
      View,
      { style: styles.topBar },
      React.createElement(View, { style: { width: 24 } }),
     
      React.createElement(View, { style: { width: 24 } })
    ),
    React.createElement(
      View,
      { style: styles.logoContainer },
      React.createElement(
        Text,
        { style: styles.logoText },
        "Global",
        React.createElement(Text, { style: styles.logoO }, "O"),
        "ne"
      )
    ),
    React.createElement(
      View,
      { style: styles.pinArea },
      React.createElement(
        View,
        { style: styles.pinLabelRow },
        React.createElement(Text, { style: styles.pinLabel }, "Email")
      ),
      React.createElement(TextInput, {
        style: styles.textInput,
        autoCapitalize: "none",
        keyboardType: "email-address",
        value: email,
        onChangeText: (value: string) => {
          setEmail(value);
          clearError();
        },
      }),
      React.createElement(
        View,
        { style: styles.pinLabelRow },
        React.createElement(Text, { style: styles.pinLabel }, "Enter app PIN"),
        React.createElement(
          TouchableOpacity,
          null,
          React.createElement(Text, { style: styles.forgotPin }, "Forgot PIN")
        )
      ),
      React.createElement(TextInput, {
        style: styles.pinInput,
        secureTextEntry: true,
        maxLength: 6,
        keyboardType: "numeric",
        value: pin,
        onChangeText: (value: string) => {
          setPin(value);
          clearError();
        },
        placeholder: "••••",
        placeholderTextColor: "#ccc",
      }),
      error
        ? React.createElement(
            TouchableOpacity,
            {
              style: styles.errorBanner,
              activeOpacity: 0.8,
              onPress: () => setShowErrorModal(true),
            },
            React.createElement(Text, { style: styles.errorIcon }, "!"),
            React.createElement(Text, { style: styles.errorBannerText }, error)
          )
        : null,
      React.createElement(
        TouchableOpacity,
        {
          style: [styles.submitButton, isSubmitting && styles.disabledButton],
          onPress: handleSubmit,
          disabled: isSubmitting,
        },
        React.createElement(
          LinearGradient,
          { colors: ["#7C6EF7", "#4A6CF7"], style: styles.gradientButton },
          React.createElement(
            Text,
            { style: styles.submitText },
            isSubmitting ? "Signing in..." : "Submit"
          )
        )
      )
    ),
    React.createElement(
      View,
      { style: styles.biometricsSection },
      React.createElement(
        View,
        { style: styles.biometricsRow },
        React.createElement(
          View,
          { style: styles.biometricsText },
          React.createElement(Text, { style: styles.biometricsTitle }, "Biometrics"),
          React.createElement(
            Text,
            { style: styles.biometricsSubtitle },
            "Sign in and authenticate with fingerprint or facial recognition"
          )
        ),
        React.createElement(Switch, {
          value: biometricsEnabled,
          onValueChange: setBiometricsEnabled,
          trackColor: { false: colors.greyLine, true: colors.primary },
          thumbColor: "#fff",
        })
      ),
      React.createElement(
        TouchableOpacity,
        {
          style: styles.dontShowRow,
          onPress: () => setDontShowAgain(!dontShowAgain),
          activeOpacity: 0.7,
        },
        React.createElement(
          View,
          { style: [styles.checkbox, dontShowAgain && styles.checkboxChecked] },
          dontShowAgain ? React.createElement(Text, { style: styles.checkmark }, "✓") : null
        ),
        React.createElement(Text, { style: styles.dontShowText }, "Don't show me this again")
      )
    ),
    React.createElement(
      Modal,
      {
        transparent: true,
        visible: showErrorModal && !!error,
        animationType: "fade",
        onRequestClose: () => setShowErrorModal(false),
      },
      React.createElement(
        View,
        { style: styles.modalOverlay },
        React.createElement(
          View,
          { style: styles.errorModal },
          React.createElement(
            View,
            { style: styles.modalIconCircle },
            React.createElement(Text, { style: styles.modalIcon }, "!")
          ),
          React.createElement(Text, { style: styles.modalTitle }, "Could not sign in"),
          React.createElement(Text, { style: styles.modalMessage }, error),
          React.createElement(
            TouchableOpacity,
            {
              style: styles.modalButton,
              activeOpacity: 0.85,
              onPress: () => setShowErrorModal(false),
            },
            React.createElement(Text, { style: styles.modalButtonText }, "Got it")
          )
        )
      )
    ),
    React.createElement(View, { style: styles.bottomSpacer })
  );
}

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
  topPill: {
    
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
    marginBottom: 20,
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
