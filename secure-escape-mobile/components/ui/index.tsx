import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "@/utils/theme";

export { BankingScreen, ScreenSection, Surface } from "./BankingScreen";

export function ErrorRow({
  message,
  onRetry,
  style,
}: {
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityRole={onRetry ? "button" : undefined}
      disabled={!onRetry}
      onPress={onRetry}
      style={[styles.errorRow, style]}
    >
      <Ionicons name="alert-circle-outline" size={18} color={colors.dangerStrong} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && <Text style={styles.retryText}>Retry</Text>}
    </TouchableOpacity>
  );
}

export function EmptyState({
  title,
  message,
  icon = "file-tray-outline",
  style,
}: {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.emptyState, style]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
    </View>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radii.md,
  },
  errorText: { ...typography.error, flex: 1 },
  retryText: { ...typography.label, color: colors.dangerStrong },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primarySubtle,
  },
  emptyTitle: { ...typography.rowLabel, textAlign: "center" },
  emptyMessage: { ...typography.helper, marginTop: spacing.xs, textAlign: "center" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  loadingText: typography.helper,
});