// app/(tabs)/account-detail.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

// ---------- Helper: format balance with spaces ----------
const formatBalance = (amount: number) => {
  const fixed = amount.toFixed(2);
  const parts = fixed.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R ${intPart}.${parts[1]}`;
};

// ---------- Seeded pseudo-random generator ----------
// Deterministic random based on a seed (account id + session day)
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate a seed from account id and current date (YYYY-MM-DD)
// This makes transactions change daily, but consistent per account per day.
const getSeed = (accountId: string) => {
  const date = new Date();
  const day = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  let hash = 0;
  for (let i = 0; i < accountId.length; i++) {
    hash = (hash << 5) - hash + accountId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash + day);
};

// ---------- Generate mock transactions ----------
type Transaction = {
  id: string;
  desc: string;
  category: string;
  amount: number;
  status: "Pending" | "Completed";
  date: Date;
};

const generateMockTransactions = (accountId: string, accountName: string, balance: number) => {
  const seed = getSeed(accountId);
  const random = () => seededRandom(seed + (Object.keys(transactions).length || 0) * 7919);

  const descriptions = [
    "SMS Notification Fee", "Uber", "Transfer", "Prepaid Mobile Purchase Fee",
    "Telkom Mobile", "Transfer", "Salary Deposit", "Online Shopping",
    "Restaurant", "Interest Earned", "ATM Withdrawal", "Groceries",
    "Petrol", "Insurance Premium", "Loan Repayment", "Dividend",
  ];
  const categories = [
    "Fees", "Other Transport", "Transfer", "Fees", "Cellphone",
    "Other Transport", "Income", "Shopping", "Food", "Income",
    "Cash", "Groceries", "Transport", "Insurance", "Loan", "Investment",
  ];

  // Generate 15–25 transactions
  const count = 15 + Math.floor(seededRandom(seed + 1234) * 10);
  const transactions: Transaction[] = [];

  // Ensure at least a few recent transactions
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const isCredit = seededRandom(seed + i * 7) > 0.7; // 30% chance credit
    const amount = isCredit
      ? Math.floor(seededRandom(seed + i * 13) * 5000 * 100) / 100
      : -Math.floor(seededRandom(seed + i * 17) * 500 * 100) / 100;
    if (Math.abs(amount) < 0.5) continue; // skip tiny amounts

    const descIdx = Math.floor(seededRandom(seed + i * 23) * descriptions.length);
    const catIdx = Math.floor(seededRandom(seed + i * 29) * categories.length);
    const daysAgo = Math.floor(seededRandom(seed + i * 37) * 30); // up to 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    transactions.push({
      id: `${accountId}-${i}`,
      desc: descriptions[descIdx % descriptions.length],
      category: categories[catIdx % categories.length],
      amount: parseFloat(amount.toFixed(2)),
      status: seededRandom(seed + i * 43) > 0.9 ? "Pending" : "Completed",
      date: date,
    });
  }

  // Sort by date descending (most recent first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  return transactions;
};

// ---------- Helper: group by month ----------
const groupByMonth = (transactions: any[]) => {
  const groups: { [key: string]: any[] } = {};
  transactions.forEach((tx) => {
    const monthYear = tx.date.toLocaleString("en-US", { month: "short", year: "numeric" });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(tx);
  });
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
  const sorted: { [key: string]: any[] } = {};
  sortedKeys.forEach((k) => { sorted[k] = groups[k]; });
  return sorted;
};

export default function AccountDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountId: string;
    accountName: string;
    balance: string;
  }>();

  const accountId = params.accountId || "mock-1";
  const accountName = params.accountName || "Main Account";
  const balance = parseFloat(params.balance || "28840");

  const [filter, setFilter] = useState<"All" | "Money In" | "Money Out">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate seeded mock transactions (only once)
  const transactions = useMemo(
    () => generateMockTransactions(accountId, accountName, balance),
    [accountId, accountName, balance]
  );

  // Filter by type
  const filteredByType = transactions.filter((tx) => {
    if (filter === "Money In") return tx.amount > 0;
    if (filter === "Money Out") return tx.amount < 0;
    return true;
  });

  // Search filter
  const filtered = filteredByType.filter((tx) => {
    if (searchQuery.trim() === "") return true;
    const query = searchQuery.toLowerCase().trim();
    const descMatch = tx.desc.toLowerCase().includes(query);
    const amountMatch = tx.amount.toString().includes(query);
    return descMatch || amountMatch;
  });

  const grouped = groupByMonth(filtered);

  const renderItem = ({ item }: { item: any }) => {
    const isCredit = item.amount > 0;
    const statusColor = item.status === "Pending" ? "#FFA500" : "#4CAF50";
    return (
      <View style={styles.transactionItem}>
        <View style={styles.txLeft}>
          <Text style={styles.txDesc}>{item.desc}</Text>
          <Text style={styles.txMeta}>
            {item.date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {item.status === "Pending" && (
              <Text style={[styles.txStatus, { color: statusColor }]}>
                {" "}
                (Pending)
              </Text>
            )}
          </Text>
          <Text style={styles.txCategory}>{item.category}</Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isCredit ? "#4CAF50" : colors.navy },
          ]}
        >
          {isCredit ? "+" : ""}
          {item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderGroup = (month: string, transactions: any[]) => (
    <View key={month} style={styles.groupContainer}>
      <View style={styles.monthHeaderRow}>
        <Text style={styles.monthHeader}>{month}</Text>
        <TouchableOpacity>
          <Text style={styles.statementLink}>Statement &gt;</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color="#ddd" />
      <Text style={styles.emptyText}>No transactions found</Text>
    </View>
  );

  // Available balance (mock: subtract a small fee)
  const availableBalance = balance - 0.5;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{accountName}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available</Text>
          <Text style={styles.balanceAmount}>{formatBalance(availableBalance)}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, filter === "All" && styles.activeTab]}
            onPress={() => setFilter("All")}
          >
            <Text style={[styles.tabText, filter === "All" && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === "Money In" && styles.activeTab]}
            onPress={() => setFilter("Money In")}
          >
            <Text
              style={[
                styles.tabText,
                filter === "Money In" && styles.activeTabText,
              ]}
            >
              Money In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === "Money Out" && styles.activeTab]}
            onPress={() => setFilter("Money Out")}
          >
            <Text
              style={[
                styles.tabText,
                filter === "Money Out" && styles.activeTabText,
              ]}
            >
              Money Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#aaa"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions"
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Transactions */}
        {Object.keys(grouped).length === 0
          ? renderEmpty()
          : Object.keys(grouped).map((month) => renderGroup(month, grouped[month]))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyBg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  balanceLabel: { fontSize: 14, color: "#888" },
  balanceAmount: { fontSize: 28, fontWeight: "700", color: colors.navy, marginTop: 4 },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  activeTabText: { color: colors.primary },
  searchRow: { marginBottom: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f5",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexShrink: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 4,
    letterSpacing: 0.3,
    color: colors.navy,
  },
  clearButton: { padding: 4 },
  groupContainer: { marginBottom: 24 },
  monthHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    letterSpacing: 0.3,
  },
  statementLink: { fontSize: 13, fontWeight: "500", color: colors.primary },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f5",
  },
  txLeft: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "600", color: colors.navy },
  txMeta: { fontSize: 12, color: "#999", marginTop: 2 },
  txStatus: { fontWeight: "500" },
  txCategory: { fontSize: 11, color: "#aaa", marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "700" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: { fontSize: 16, color: "#aaa", marginTop: 12 },
});