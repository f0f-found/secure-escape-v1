// styles/theme.js
//
// Single source of truth for SecureEscape's design system.
// - Every legacy token name is preserved so existing imports don't break.
// - New semantic tokens (surfaces, borders, states, radii, spacing, type scale)
//   are added so screens stop inventing local values.
// - Shadow values are softened; shadows are no longer used as decoration.

import { StyleSheet } from "react-native";

/* ---------------------------------- Colour -------------------------------- */
//
// Purple is used deliberately: primary CTAs, active navigation, selected
// states, key accents. Neutral surfaces carry structure so important
// financial information stands out.

export const colors = {
  // Brand — purple
  primary: "#25145F",
  primaryDark: "#25145F",
  primaryLight: "#513A9A",
  primaryPressed: "#1B0E45",
  primaryDisabled: "#C9C1E5",
  primarySubtle: "#EFEBFC", // light purple for active pills, selected rows

  // Brand — secondary / accent (keep, use sparingly)
  secondary: "#00BFA6",
  accent: "#FF9F43",

  // Neutrals — text
  navy: "#1A1A4B",        // headings / primary text on light
  textMain: "#1E293B",    // body
  textSub: "#64748B",     // metadata, secondary
  textLight: "#94A3B8",   // placeholders / disabled text
  textInverse: "#FFFFFF", // on brand / dark surfaces

  // Surfaces
  white: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#F8F9FC", // == greyBg
  greyBg: "#F8F9FC",
  inputBg: "#FFFFFF",

  // Borders / dividers
  greyLine: "#E9ECF2",
  border: "#E9ECF2",
  borderStrong: "#D6D9E0",
  divider: "#EEF0F4",

  // Semantic — danger
  danger: "#FF6B6B",       // legacy tint / icon colour
  dangerStrong: "#DC2626", // text on light — passes AA
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",

  // Semantic — success
  success: "#16A34A",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",

  // Semantic — warning
  warning: "#B45309",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",

  // Financial
  credit: "#16A34A",       // money in
  debit: "#1A1A4B",        // money out
  pending: "#B45309",      // awaiting confirmation

  // Gradients (legacy — retained for any remaining LinearGradient call sites;
  // new work should use solid `primary` instead)
  gradientStart: "#25145F",
  gradientEnd: "#25145F",
  gradientSecondary: "#00BFA6",

  // Misc
  cardShadow: "#000000",
};

/* ---------------------------------- Radii --------------------------------- */
//
// Deliberately restrained. Cards and inputs sit at md, buttons at md,
// pills and small controls at sm. Avoid >=16 except where a component is
// specifically circular (avatars, icon buttons).

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

/* --------------------------------- Spacing -------------------------------- */
//
// One scale for the entire app. Use these everywhere; do not invent
// screen-specific values.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/* --------------------------------- Sizing --------------------------------- */
//
// Fixed control heights and layout metrics. Named so a button on Payments
// and a button on SecureEscape is guaranteed the same height.

export const sizing = {
  inputHeight: 52,
  buttonHeight: 52,
  touchTarget: 44,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  appBarHeight: 56,
  bottomNavHeight: 64,
};

/* -------------------------------- Shadows --------------------------------- */
//
// Softer than before. Elevation is used only where it communicates
// something (modals, bottom sheets, floating actions). Cards on flat
// backgrounds should prefer a 1px border over a shadow.

export const shadows = {
  none: {},
  small: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
};

/* ------------------------------- Typography ------------------------------- */
//
// One scale, applied consistently. Existing names are preserved.
// New names are the ones components should consume going forward.

export const typography = StyleSheet.create({
  // ----- Legacy names (kept) -----
  heading1: { fontSize: 32, fontWeight: "800", color: colors.navy },
  heading2: { fontSize: 24, fontWeight: "800", color: colors.navy },
  heading3: { fontSize: 20, fontWeight: "700", color: colors.navy },
  body: { fontSize: 14, fontWeight: "400", color: colors.textMain },
  caption: { fontSize: 12, fontWeight: "500", color: colors.textSub },
  buttonText: { fontSize: 16, fontWeight: "700", color: colors.white },

  // ----- Semantic names (use these) -----
  // Screen titles — "My Dashboard", "Pay Beneficiary"
  screenTitle: { fontSize: 24, fontWeight: "800", color: colors.navy, letterSpacing: -0.3 },
  // Section headings — "Accounts", "Favourites"
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  // List row label — account name, beneficiary name
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.navy },
  // List row meta — date, category, reference
  rowMeta: { fontSize: 12, fontWeight: "500", color: colors.textSub },
  // Financial amounts
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
  },
  amountLarge: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
  },
  // Form
  label: { fontSize: 13, fontWeight: "600", color: colors.navy },
  input: { fontSize: 15, fontWeight: "400", color: colors.navy },
  helper: { fontSize: 12, fontWeight: "400", color: colors.textSub },
  error: { fontSize: 12, fontWeight: "500", color: colors.dangerStrong },
  // Navigation
  navLabel: { fontSize: 11, fontWeight: "600" },
});

/* ----------------------------- Common styles ------------------------------ */
//
// Evolved in place. Legacy call sites keep working; visual language is
// tightened to the new system (smaller radii, flat surfaces, minimal
// elevation, no overlap offsets).

export const commonStyles = StyleSheet.create({
  // App bar. Historically a gradient; new work should render a solid
  // `colors.primary` surface. Radius reduced so headers read as a bar,
  // not a floating panel.
  gradientHeader: {
    paddingTop: 48,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // Card. Was radius 28 with a heavy shadow and a negative top offset
  // that overlapped the header. Now a flat white surface with a 1px
  // border and a small radius.
  whiteCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: 0,
    ...shadows.small,
  },

  // Primary button. Was a pill with a drop shadow. Now a flat, full-width
  // button with a controlled radius. Height matches every other button.
  primaryButton: {
    height: sizing.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.2,
  },

  // Back button. Kept for screens that render their own app bar content.
  // Newer screens should consume the shared <ScreenHeader /> component.
  backButton: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
});