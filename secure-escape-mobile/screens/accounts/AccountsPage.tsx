import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "@/utils/theme";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getAccounts } from "@/services/accountService";
import { AccountResponse } from "@/types/account";

const ACCOUNT_GRADIENTS: readonly [string, string][] = [
  ["#6C63FF", "#4A3DB7"],
  ["#5B8DEF", "#3B63C4"],
  ["#FF6B6B", "#C0392B"],
];

const STATUS_META: Record<string, { bg: string; color: string }> = {
  Active: { bg: "rgba(255,255,255,0.2)", color: "#fff" },
  Frozen: { bg: "rgba(255,255,255,0.2)", color: "#fff" },
  Suspended: { bg: "rgba(255,255,255,0.2)", color: "#fff" },
  Closed: { bg: "rgba(255,255,255,0.2)", color: "#fff" },
};

const maskAccountNumber = (accountNumber: string) => {
  const last4 = accountNumber.slice(-4);
  return `•••• •••• ${last4}`;
};

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, []),
  );

  const handleAccountPress = (account: AccountResponse) => {
    router.push({
      pathname: "/accounts/account-detail",
      params: { id: account.id },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        )}

        {error && (
          <TouchableOpacity onPress={loadAccounts}>
            <Text style={styles.errorText}>{error}</Text>
          </TouchableOpacity>
        )}

        {!isLoading && !error && accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color={colors.greyLine} />
            <Text style={styles.emptyText}>No accounts found</Text>
          </View>
        )}

        {accounts.map((account, index) => {
          const statusMeta = STATUS_META[account.status] ?? STATUS_META.Active;

          return (
            <TouchableOpacity
              key={account.id}
              activeOpacity={0.8}
              onPress={() => handleAccountPress(account)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={ACCOUNT_GRADIENTS[index % ACCOUNT_GRADIENTS.length]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{account.accountType}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusMeta.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusMeta.color }]}
                    >
                      {account.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardNumber}>
                  {maskAccountNumber(account.accountNumber)}
                </Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.accName}>{account.accountName}</Text>
                    {account.isDecoyView && (
                      <Text style={styles.decoyBadge}>⚠ Decoy View</Text>
                    )}
                  </View>
                  <Text style={styles.balance}>
                    {account.currency === "ZAR" ? "R" : account.currency}{" "}
                    {account.availableBalance.toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyBg ?? "#f5f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  cardWrapper: { marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  accName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.9,
  },
  decoyBadge: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "600",
  },
  balance: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  errorText: {
    marginTop: 20,
    marginBottom: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
