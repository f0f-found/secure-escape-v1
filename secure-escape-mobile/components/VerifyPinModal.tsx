import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/utils/theme";
import { verifyPin } from "@/services/authService";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onVerified: () => void;
  title?: string;
  subtitle?: string;
};

export default function VerifyPinModal({
  visible,
  onCancel,
  onVerified,
  title = "Confirm it's you",
  subtitle = "Enter your Login PIN to continue",
}: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setPin("");
    setError("");
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (pin.length < 4) {
      setError("Enter your PIN.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const result = await verifyPin(pin);

      if (result.verified) {
        reset();
        onVerified();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.content}
          onPress={() => {}}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <TextInput
            style={styles.pinInput}
            placeholder="• • • •"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={(v) => {
              const digitsOnly = v.replace(/[^0-9]/g, "");
              setPin(digitsOnly);
              setError("");
            }}
            autoFocus
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <LinearGradient
                colors={["#6C63FF", "#5B8DEF"]}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>
                  {submitting ? "Checking..." : "Confirm"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.navy },
  subtitle: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
    marginBottom: 20,
  },
  pinInput: {
    fontSize: 26,
    fontWeight: "300",
    letterSpacing: 14,
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    width: "70%",
    color: colors.navy,
  },
  error: { color: "#DC2626", fontSize: 13, fontWeight: "600", marginTop: 12 },
  buttonRow: { flexDirection: "row", width: "100%", gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "#f0f0f5",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#888" },
  confirmButton: { flex: 1, borderRadius: 30, overflow: "hidden" },
  confirmGradient: { paddingVertical: 14, alignItems: "center" },
  confirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
