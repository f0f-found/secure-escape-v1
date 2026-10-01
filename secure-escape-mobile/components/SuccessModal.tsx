import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";

type SuccessDetail = {
  label: string;
  value?: string | null;
};

type SuccessModalProps = {
  visible: boolean;
  title: string;
  message: string;
  details?: SuccessDetail[];
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export default function SuccessModal({
  visible,
  title,
  message,
  details = [],
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: SuccessModalProps) {
  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onPrimaryPress}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={38} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {visibleDetails.length > 0 && (
            <View style={styles.detailsBox}>
              {visibleDetails.map((detail, index) => (
                <View
                  key={`${detail.label}-${index}`}
                  style={[styles.detailRow, index > 0 && styles.detailDivider]}
                >
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          )}

          {secondaryLabel && onSecondaryPress && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSecondaryPress}
            >
              <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  detailsBox: {
    width: "100%",
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: { paddingVertical: 12 },
  detailDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  detailLabel: { fontSize: 12, fontWeight: "700", color: colors.textSub },
  detailValue: { marginTop: 4, fontSize: 14, fontWeight: "800", color: colors.navy },
  secondaryButton: {
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.primary, fontWeight: "800" },
  primaryButton: {
    marginTop: 10,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
