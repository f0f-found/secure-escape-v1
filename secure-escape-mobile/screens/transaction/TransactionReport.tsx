import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import {
  TransactionType,
  TransactionStatus,
  TransactionResponse,
} from "@/types/transaction"; // use your actual existing import path
import { getTransactions } from "@/services/transactionServices";

const TYPE_META: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    bg: string;
    color: string;
  }
> = {
  Transfer: {
    icon: "swap-horizontal",
    label: "Transfer",
    bg: "#EDE9FE",
    color: colors.primary,
  },
  CashVoucher: {
    icon: "cash-outline",
    label: "Cash Send",
    bg: "#E6F7EE",
    color: "#1FA971",
  },
};

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Approved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" },
  DecoyApproved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" }, // indistinguishable by design
  Failed: { label: "Failed", bg: "#FDECEC", color: "#E5484D" },
  Pending: { label: "Pending", bg: "#FFF6E5", color: "#B98900" },
  Blocked: { label: "Blocked", bg: "#FDECEC", color: "#E5484D" },
  Delayed: { label: "Delayed", bg: "#FFF6E5", color: "#B98900" },
};

export default function TransactionReport() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, []),
  );

  const sortedData = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filteredData = sortedData.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      item.beneficiaryName,
      item.bankReference,
      item.description,
      item.amount?.toString(),
    ]
      .filter(Boolean)
      .some((value) => (value as string).toLowerCase().includes(query));
  });

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) =>
    `${currency === "ZAR" ? "R" : currency} ${amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderItem = ({ item }: { item: TransactionResponse }) => {
    const typeMeta = TYPE_META[item.transactionType] ?? {
      icon: "receipt-outline",
      label: "Transaction",
      bg: "#F0F0F0",
      color: "#888",
    };
    const statusMeta = STATUS_META[item.status] ?? {
      label: "Unknown",
      bg: "#F0F0F0",
      color: "#888",
    };

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          router.push({
            pathname: "/transactions/transaction-detail",
            params: { transaction: JSON.stringify(item) },
          })
        }
        // onPress={() =>
        //   router.push({
        //     pathname: "/transactions/transaction-detail",
        //     params: { transactionId: item.id },
        //   })
        // }
      >
        <View style={[styles.iconCircle, { backgroundColor: typeMeta.bg }]}>
          <Ionicons name={typeMeta.icon} size={20} color={typeMeta.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.beneficiaryName || typeMeta.label}
          </Text>
          <Text style={styles.subText}>
            {typeMeta.label} • {item.bankReference}
          </Text>
          <Text style={styles.subText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amount}>
            {formatAmount(item.amount, item.currency)}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reference, name or amount"
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

        {loading && <ActivityIndicator color={colors.primary} />}
        {!!error && !loading && <Text style={styles.emptyText}>{error}</Text>}

        <FlatList
          data={loading || error ? [] : filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "No transactions match your search"
                : "No transactions found"}
            </Text>
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
    paddingBottom: 44,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    marginTop: -20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 4,
    letterSpacing: 0.3,
  },
  listContent: { paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.navy },
  subText: { fontSize: 12, color: "#888", marginTop: 2 },
  amountCol: { alignItems: "flex-end" },
  amount: { fontSize: 14, fontWeight: "700", color: colors.navy },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#aaa" },
});
