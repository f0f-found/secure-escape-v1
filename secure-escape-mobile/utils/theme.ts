// styles/theme.js
import { StyleSheet } from "react-native";

export const colors = {
  primary: "#6C63FF",
  primaryDark: "#5A52D6",
  primaryLight: "#8F87FF",
  secondary: "#00BFA6",
  accent: "#FF9F43",
  danger: "#FF6B6B",
  navy: "#1A1A4B",
  white: "#FFFFFF",
  greyBg: "#F8F9FC",
  greyLine: "#E9ECF2",
  textMain: "#1E293B",
  textSub: "#64748B",
  textLight: "#94A3B8",
  gradientStart: "#5B8DEF",
  gradientEnd: "#6C63FF",
  gradientSecondary: "#00BFA6",
  cardShadow: "#000000",
};

export const shadows = {
  small: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const typography = StyleSheet.create({
  heading1: { fontSize: 32, fontWeight: "800", color: colors.navy },
  heading2: { fontSize: 24, fontWeight: "800", color: colors.navy },
  heading3: { fontSize: 20, fontWeight: "700", color: colors.navy },
  body: { fontSize: 14, fontWeight: "400", color: colors.textMain },
  caption: { fontSize: 12, fontWeight: "500", color: colors.textSub },
  buttonText: { fontSize: 16, fontWeight: "700", color: colors.white },
});

export const commonStyles = StyleSheet.create({
  gradientHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  whiteCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 16,
    marginTop: -20,
    ...shadows.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    ...shadows.small,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});
