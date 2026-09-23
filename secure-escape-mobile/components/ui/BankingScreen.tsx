import React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { colors, spacing, typography } from "@/utils/theme";

/** Shared presentation primitives for new and gradually migrated screens. */
export function BankingScreen({ style, children, ...props }: ViewProps) {
  return <View {...props} style={[styles.screen, style]}>{children}</View>;
}

export function ScreenSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

export function Surface({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceMuted },
  section: { marginHorizontal: spacing.xl, marginVertical: spacing.lg, gap: spacing.md },
  sectionTitle: typography.sectionTitle,
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg },
});
