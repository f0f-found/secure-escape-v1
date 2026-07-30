import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";

type ErrorBannerProps = {
  message: string | null;
  onPress: () => void;
};

type ErrorModalProps = {
  title: string;
  message: string | null;
  visible: boolean;
  onClose: () => void;
};

export function ErrorBanner({ message, onPress }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.errorBanner} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name="alert-circle" size={18} color="#B91C1C" />
      <Text style={styles.errorBannerText}>{message}</Text>
    </TouchableOpacity>
  );
}

export function ErrorModal({
  title,
  message,
  visible,
  onClose,
}: ErrorModalProps) {
  return (
    <Modal
      transparent
      visible={visible && !!message}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.errorModal}>
          <View style={styles.modalIconCircle}>
            <Ionicons name="alert-circle" size={30} color="#DC2626" />
          </View>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.modalButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
