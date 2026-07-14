import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
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
  const [password, setPassword] = useState("Password@123");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

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
    if (!email || !password || pin.length < 4) {
      Alert.alert(
        "Missing details",
        "Please enter your email, password, and PIN.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const loginContext = await getLoginContext();
      const response = await login({
        email,
        password,
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
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.pill} />
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
          onChangeText={setEmail}
        />
        <View style={styles.pinLabelRow}>
          <Text>Password</Text>
        </View>

        <TextInput
          style={styles.textInput}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.pinLabelRow}>
          <Text>Enter app PIN</Text>
          <Text style={styles.forgotPin}>Forgot PIN</Text>
        </View>

        <TextInput
          style={styles.pinInput}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={pin}
          onChangeText={setPin}
        />

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

        <View style={styles.dontShowRow}>
          <Switch
            value={dontShowAgain}
            onValueChange={setDontShowAgain}
            trackColor={{ false: "#ccc", true: colors.primary }}
          />
          <Text>Don&apos;t show me this again</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
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
});
