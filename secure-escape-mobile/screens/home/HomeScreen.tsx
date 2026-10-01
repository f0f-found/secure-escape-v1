
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { getAccounts } from "@/services/accountService";
import { AccountResponse } from "@/types/account";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";
import { useFocusEffect, useRouter } from "expo-router";
import { logout } from "@/services/authService";

export default function HomeScreen() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [profile, setProfile] = useState<ProfileMeResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await getProfileMe();
      setProfile(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load accounts."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logoutButton = async () => {
    try {
      await logout();
      router.replace("/(auth)");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to Logout"
      );
    }
  };

  const accountRows = accounts.map((account, index) => ({
    id: account.id,
    name: account.accountName,
    balance: account.availableBalance,
    isDecoyView: account.isDecoyView,
    icon: index === 0
      ? "wallet-outline"
      : "trending-up-outline",
    accent: index === 0
      ? colors.primary
      : colors.navy,
  }));

  const favourites = [
    {
      label: "Pay Beneficiary",
      icon: "people-outline",
      link: "/beneficiaries/beneficiary-list",
    },
    {
      label: "Transfer",
      icon: "swap-horizontal-outline",
      link: "/beneficiaries/beneficiary-list",
    },
    {
      label: "Send Cash",
      icon: "cash-outline",
      link: "/transactions/create-cash-send",
    },
    {
      label: "Cards",
      icon: "card-outline",
      link: "/(tabs)/cards",
    },
    {
      label: "Transaction Report",
      icon: "stats-chart-outline",
      link: "/transactions/report",
    },
    {
      label: "Financial Advice",
      icon: "document-text-outline",
      link: "/advice/financial-advice",
    },
    {
      label: "Security Tips",
      icon: "shield-checkmark-outline",
      link: "/advice/security-tips",
    },
  ];

  const handleFavPress = (item: (typeof favourites)[0]) => {
    if (item.link) {
      router.push(item.link as never);
    } else {
      Alert.alert(
        "Coming Soon",
        `The "${item.label}" feature will be available in the next sprint.`,
        [{ text: "OK" }]
      );
    }
  };

  const formatCurrency = (value: number) =>
    `R ${value.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <View style={styles.pageContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      {/* ─────────────────────────────
          PURPLE DASHBOARD HEADER
      ───────────────────────────── */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerEyebrow}>
              MY DASHBOARD
            </Text>

            <View style={styles.headerAccent} />
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={logoutButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeLabel}>
            Welcome back,
          </Text>

          <Text
            style={styles.userName}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {profile?.fullName || "User"}
          </Text>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.headerFooter}>
          <View style={styles.headerFooterIcon}>
            <Ionicons
              name="grid-outline"
              size={15}
              color="#E4E1FF"
            />
          </View>

          <Text style={styles.headerFooterText}>
            Your money, at a glance
          </Text>
        </View>
      </View>

      {/* ─────────────────────────────
          DASHBOARD CONTENT
      ───────────────────────────── */}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* LOADING */}

        {isLoading && (
          <View style={styles.stateRow}>
            <ActivityIndicator
              color={colors.primary}
              size="small"
            />

            <Text style={styles.stateText}>
              Loading accounts...
            </Text>
          </View>
        )}

        {/* ERROR */}

        {error && !isLoading && (
          <TouchableOpacity
            style={styles.errorRow}
            onPress={loadAccounts}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.dangerStrong}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Text style={styles.errorRetry}>
              Retry
            </Text>
          </TouchableOpacity>
        )}

        {/* ─────────────────────────
            ACCOUNTS
        ───────────────────────── */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Accounts
            </Text>

            <Text style={styles.sectionMeta}>
              {accounts.length} active account
              {accounts.length === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.accountsList}>
            {accountRows.map((account) => (
              <TouchableOpacity
                key={account.id}
                activeOpacity={0.7}
                style={styles.accountRow}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(tabs)/accounts/account-detail",
                    params: {
                      accountId: account.id,
                      accountName: account.name,
                      balance: account.balance.toString(),
                    },
                  })
                }
              >
                <View
                  style={[
                    styles.accountAccent,
                    {
                      backgroundColor: account.accent,
                    },
                  ]}
                />

                <View style={styles.accountBody}>
                  <View style={styles.accountIcon}>
                    <Ionicons
                      name={
                        account.icon as keyof typeof Ionicons.glyphMap
                      }
                      size={20}
                      color={account.accent}
                    />
                  </View>

                  <View style={styles.accountText}>
                    <Text
                      style={styles.accountName}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>

                    <Text
                      style={styles.accountBalance}
                      numberOfLines={1}
                    >
                      {formatCurrency(account.balance)}
                    </Text>

                    {account.isDecoyView && (
                      <Text style={styles.decoyBadge}>
                        Decoy view
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textLight}
                  />
                </View>
              </TouchableOpacity>
            ))}

            {!isLoading &&
              !error &&
              accountRows.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>
                    No accounts yet
                  </Text>

                  <Text style={styles.emptyText}>
                    Your accounts will appear here
                    once they are set up.
                  </Text>
                </View>
              )}
          </View>
        </View>

        {/* ─────────────────────────
            QUICK ACTIONS
        ───────────────────────── */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Quick actions
              </Text>

              <Text style={styles.sectionMeta}>
                Move money and stay informed
              </Text>
            </View>
          </View>

          <View style={styles.favGrid}>
            {favourites.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.favTile}
                activeOpacity={0.7}
                onPress={() => handleFavPress(item)}
              >
                <View style={styles.favIconWrap}>
                  <Ionicons
                    name={
                      item.icon as keyof typeof Ionicons.glyphMap
                    }
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={styles.favLabel}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 24,
    paddingBottom: 33,
  },

  // ─────────────────────────
  // PURPLE HEADER
  // ─────────────────────────

  header: {
    backgroundColor: colors.primaryDark,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 24) + 12
        : 64,
    paddingHorizontal: 24,
    paddingBottom: 26,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  headerTitleGroup: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E4E1FF",
    letterSpacing: 1.1,
  },

  headerAccent: {
    width: 28,
    height: 2,
    backgroundColor: "#B5A9FF",
    borderRadius: 1,
    marginTop: 9,
  },

  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.17)",
  },

  welcomeSection: {
    marginBottom: 25,
  },

  welcomeLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#E4E1FF",
    marginBottom: 5,
  },

  userName: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.7,
    lineHeight: 39,
  },

  headerDivider: {
    display: "none",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginBottom: 16,
  },

  headerFooter: {
    display: "none",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headerFooterIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  headerFooterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#E4E1FF",
    letterSpacing: 0.1,
  },

  // ─────────────────────────
  // LOADING & ERROR
  // ─────────────────────────

  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  stateText: {
    color: colors.textSub,
    fontSize: 13,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
  },

  errorText: {
    flex: 1,
    color: colors.dangerStrong,
    fontSize: 13,
    fontWeight: "500",
  },

  errorRetry: {
    color: colors.dangerStrong,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // ─────────────────────────
  // SECTIONS
  // ─────────────────────────

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
  },

  sectionMeta: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 3,
  },

  // ─────────────────────────
  // ACCOUNTS
  // ─────────────────────────

  accountsList: {
    paddingHorizontal: 16,
    gap: 8,
  },

  accountRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },

  accountAccent: {
    width: 4,
  },

  accountBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },

  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },

  accountText: {
    flex: 1,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },

  accountBalance: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.credit,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },

  decoyBadge: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 4,
    fontWeight: "600",
  },

  emptyState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
    textAlign: "center",
  },

  // ─────────────────────────
  // QUICK ACTIONS
  // ─────────────────────────

  favGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },

  favTile: {
    width: "31%",
    minHeight: 104,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  favIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySubtle,
    marginBottom: 8,
  },

  favLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 4,
  },
});