import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SectionList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getAccountById } from "@/services/accountService";
import { getTransactions } from "@/services/transactionServices";
import { AccountResponse } from "@/types/account";
import { TransactionResponse } from "@/types/transaction";

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Approved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" },
  DecoyApproved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" },
  Failed: { label: "Failed", bg: "#FDECEC", color: "#E5484D" },
  Pending: { label: "Pending", bg: "#FFF6E5", color: "#B98900" },
  Blocked: { label: "Blocked", bg: "#FDECEC", color: "#E5484D" },
  Delayed: { label: "Delayed", bg: "#FFF6E5", color: "#B98900" },
};

export default function AccountDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [accountData, allTransactions] = await Promise.all([
        getAccountById(id),
        getTransactions(),
      ]);

      setAccount(accountData);
      setTransactions(allTransactions.filter((t) => t.bankAccountId === id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id]),
  );

  const filteredTransactions = transactions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return [
        item.beneficiaryName,
        item.bankReference,
        item.description,
        item.amount?.toString(),
      ]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(query));
    });

  const groupByMonth = (items: TransactionResponse[]) => {
    const grouped: { [key: string]: TransactionResponse[] } = {};

    items.forEach((item) => {
      const monthKey = new Date(item.createdAt).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
      });

      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });

    return Object.entries(grouped).map(([month, data]) => ({
      title: month,
      data,
    }));
  };

  const sections = groupByMonth(filteredTransactions);

  const formatAmount = (amount: number, currency: string) =>
    `${currency === "ZAR" ? "R" : currency} ${amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: TransactionResponse }) => {
    const statusMeta = STATUS_META[item.status] ?? {
      label: item.status,
      bg: "#F0F0F0",
      color: "#888",
    };

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          router.push({
            pathname: "/transactions/transaction-detail",
            params: { transaction: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.transactionLeft}>
          <Text style={styles.merchantName}>
            {item.beneficiaryName || item.description}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.metaText}>{item.transactionType}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.amount}>
            {formatAmount(item.amount, item.currency)}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}
          >
            <Text style={[styles.statusText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {account?.accountName ?? "Account"}
        </Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <View style={styles.balanceSection}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceAmount}>
              {account
                ? formatAmount(account.availableBalance, account.currency)
                : "—"}
            </Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Current</Text>
            <Text style={styles.balanceAmountSmall}>
              {account
                ? formatAmount(account.currentBalance, account.currency)
                : "—"}
            </Text>
          </View>
        </View>

        {account && (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.accountStatusBadge,
                {
                  backgroundColor:
                    account.status === "Active" ? "#E6F7EE" : "#FDECEC",
                },
              ]}
            >
              <Text
                style={[
                  styles.accountStatusText,
                  {
                    color: account.status === "Active" ? "#1FA971" : "#E5484D",
                  },
                ]}
              >
                {account.status}
              </Text>
            </View>
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        )}
        {!!error && !loading && <Text style={styles.emptyText}>{error}</Text>}

        <SectionList
          sections={loading || error ? [] : sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? "No transactions match your search"
                  : "No transactions yet"}
              </Text>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    marginTop: -16,
  },
  balanceSection: { flexDirection: "row", gap: 12, marginBottom: 12 },
  balanceBox: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 14,
  },
  balanceLabel: { fontSize: 12, color: colors.textSub, fontWeight: "600" },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    marginTop: 4,
  },
  balanceAmountSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  accountStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  accountStatusText: { fontSize: 11, fontWeight: "700" },
  accountNumber: { fontSize: 12, color: colors.textSub },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  listContent: { paddingBottom: 40 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy,
    marginTop: 14,
    marginBottom: 4,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionLeft: { flex: 1 },
  merchantName: { fontSize: 14, fontWeight: "700", color: colors.navy },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: { fontSize: 12, color: "#888" },
  dot: { fontSize: 8, color: "#888" },
  transactionRight: { alignItems: "flex-end" },
  amount: { fontSize: 14, fontWeight: "700", color: colors.navy },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#aaa" },
});
