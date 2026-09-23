
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "@/utils/theme";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";
import { getActiveDecoyProfile } from "@/services/secureEscapeService";
import { logout } from "@/services/authService";

// Local colours avoid relying on unverified theme exports.
const PURPLE = "#25145F";
const WHITE = "#FFFFFF";
const LINE = "#E9E8F0";
const PALE_PURPLE = "#F3F0FF";
const RED = "#B42332";
const PALE_RED = "#FFF0F0";

export default function SettingsScreen() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<ProfileMeResponse | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [openingSecureEscape, setOpeningSecureEscape] =
    useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const data = await getProfileMe();

        if (mounted) {
          setProfile(data);
        }
      } catch {
        if (mounted) {
          setError("Could not load your profile.");
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // Secure Escape must remain hidden until the session
  // mode is known, and throughout a duress session.
  const showSecureEscape =
    !loadingProfile &&
    profile !== null &&
    profile.sessionMode !== "Duress";

  const handleSecureEscape = async () => {
    if (!showSecureEscape || openingSecureEscape) return;

    try {
      setOpeningSecureEscape(true);
      setError("");

      const activeProfile = await getActiveDecoyProfile();

      if (activeProfile) {
        router.push("/secure-escape/manage-secure-escape");
      } else {
        router.push("/secure-escape/intro");
      }
    } catch {
      setError(
        "Could not open Secure Escape. Please try again."
      );
    } finally {
      setOpeningSecureEscape(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setError("");

      await logout();
      router.replace("/(auth)");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to log out. Please try again."
      );
      setLoggingOut(false);
    }
  };

  const fullName = profile?.fullName?.trim() || "";
  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PURPLE}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PURPLE HEADER */}

        <View style={styles.header}>
          <View style={styles.appBar}>
            <View style={styles.appBarSpacer} />

            <Text style={styles.appBarTitle}>
              Settings
            </Text>

            <View style={styles.appBarSpacer} />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.headerEyebrow}>
              YOUR ACCOUNT
            </Text>

            <Text style={styles.headerHeading}>
              Settings
            </Text>

            <Text style={styles.headerDescription}>
              Manage your personal information and
              account preferences.
            </Text>
          </View>

          <View style={styles.headerDivider} />

          <View style={styles.headerFooter}>
            <View style={styles.headerFooterIcon}>
              <Ionicons
                name="settings-outline"
                size={17}
                color="#E4E1FF"
              />
            </View>

            <Text style={styles.headerFooterText}>
              Account management
            </Text>
          </View>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {loadingProfile ? (
                <ActivityIndicator color={PURPLE} />
              ) : (
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileEyebrow}>
                SIGNED IN AS
              </Text>

              <Text
                style={styles.profileName}
                numberOfLines={2}
              >
                {loadingProfile
                  ? "Loading profile…"
                  : fullName || "Account holder"}
              </Text>

              <Text style={styles.profileSubtitle}>
                Your personal account
              </Text>
            </View>

            <Ionicons
              name="person-outline"
              size={19}
              color={colors.textSub}
            />
          </View>
        </View>

        {/* ACCOUNT SETTINGS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <Text style={styles.sectionDescription}>
            View and manage your account details.
          </Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                router.push("/settings/profile-details")
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="My information"
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={PURPLE}
                />
              </View>

              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>
                  My information
                </Text>

                <Text style={styles.menuSubtitle}>
                  View and update your information
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSub}
              />
            </TouchableOpacity>

            {/* HIDDEN IN DURESS MODE */}

            {showSecureEscape && (
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleSecureEscape}
                disabled={openingSecureEscape}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Secure Escape settings"
                accessibilityState={{
                  busy: openingSecureEscape,
                  disabled: openingSecureEscape,
                }}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={PURPLE}
                  />
                </View>

                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>
                    Secure Escape
                  </Text>

                  <Text style={styles.menuSubtitle}>
                    Manage your duress PIN and setup
                  </Text>
                </View>

                {openingSecureEscape ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textSub}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SESSION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Session
          </Text>

          <Text style={styles.sectionDescription}>
            Sign out of your account on this device.
          </Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={[
                styles.menuRow,
                loggingOut && styles.disabledRow,
              ]}
              onPress={handleLogout}
              disabled={loggingOut}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Log out"
              accessibilityState={{
                busy: loggingOut,
                disabled: loggingOut,
              }}
            >
              <View style={styles.logoutIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={RED}
                />
              </View>

              <View style={styles.menuText}>
                <Text style={styles.logoutTitle}>
                  Log out
                </Text>

                <Text style={styles.menuSubtitle}>
                  Sign out of your account
                </Text>
              </View>

              {loggingOut ? (
                <ActivityIndicator
                  size="small"
                  color={RED}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSub}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ERROR */}

        {!!error && (
          <View
            style={styles.errorBanner}
            accessibilityRole="alert"
          >
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={RED}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <Text style={styles.footerText}>
          SecureEscape
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 44,
  },

  // HEADER

  header: {
    backgroundColor: PURPLE,
  },

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 24) + 8
        : 56,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },

  appBarSpacer: {
    width: 44,
    height: 44,
  },

  appBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    textAlign: "center",
  },

  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },

  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E4E1FF",
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  headerHeading: {
    fontSize: 29,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.6,
    lineHeight: 36,
  },

  headerDescription: {
    fontSize: 13,
    color: "#E4E1FF",
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 310,
  },

  headerDivider: {
    display: "none",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginHorizontal: 24,
  },

  headerFooter: {
    display: "none",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },

  headerFooterIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerFooterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#E4E1FF",
  },

  // PROFILE

  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: PALE_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: PURPLE,
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSub,
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.navy,
  },

  profileSubtitle: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 4,
  },

  // SECTIONS

  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -0.3,
  },

  sectionDescription: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 16,
  },

  // MENU

  menuCard: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 16,
    backgroundColor: WHITE,
    overflow: "hidden",
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 12,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PALE_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    flex: 1,
    minWidth: 0,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
  },

  menuSubtitle: {
    fontSize: 12,
    color: colors.textSub,
    lineHeight: 17,
    marginTop: 4,
  },

  logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PALE_RED,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: RED,
  },

  disabledRow: {
    opacity: 0.6,
  },

  // ERROR AND FOOTER

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginTop: 22,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5C7CC",
    backgroundColor: PALE_RED,
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    color: RED,
    lineHeight: 18,
  },

  footerText: {
    fontSize: 11,
    color: colors.textSub,
    textAlign: "center",
    marginTop: 36,
  },
});