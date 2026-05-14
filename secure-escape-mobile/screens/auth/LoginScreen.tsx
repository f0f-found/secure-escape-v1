import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleSubmit = () => {
    if (pin.length === 6) {
      onLoginSuccess?.();
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
          <Text>Username</Text>
        </View>

        <TextInput
          style={styles.pinInput}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={pin}
          onChangeText={setPin}
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
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
});
