import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  SectionList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

const colors = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  background: "#FAFBFC",
  surface: "#FFFFFF",
  text: "#1A202C",
  textSecondary: "#718096",
  textTertiary: "#A0AEC0",
  border: "#E2E8F0",
  negative: "#FF9500",
  positive: "#10B981",
};

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  type: "in" | "out";
  status?: "pending" | "completed";
}

interface Account {
  id: string;
  name: string;
  type: string;
  availableBalance: number;
  totalBalance: number;
  currency: string;
  cardColor: string;
}

interface AccountDetailScreenProps {
  accountId?: string;
  account?: Account;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    merchant: "Engen",
    category: "Fuel",
    amount: -200.0,
    date: "2026-05-06",
    time: "Today",
    type: "out",
    status: "pending",
  },
  {
    id: "2",
    merchant: "Live Better Round-up Transfer",
    category: "Transfer",
    amount: -4.01,
    date: "2026-05-06",
    time: "Today",
    type: "out",
    status: "completed",
  },
  {
    id: "3",
    merchant: "Set-off Applied",
    category: "Transfer",
    amount: -173.61,
    date: "2026-05-05",
    time: "Yesterday",
    type: "out",
    status: "completed",
  },
  {
    id: "4",
    merchant: "Victory Cafe",
    category: "Restaurants",
    amount: -45.0,
    date: "2026-05-04",
    time: "04 May 2026 10:39",
    type: "out",
    status: "completed",
  },
  {
    id: "5",
    merchant: "Live Better Round-up Transfer",
    category: "Transfer",
    amount: -34.02,
    date: "2026-05-04",
    time: "04 May 2026 01:27",
    type: "out",
    status: "completed",
  },
  {
    id: "6",
    merchant: "Tabbs *victory Cafe",
    category: "Groceries",
    amount: -16.0,
    date: "2026-05-03",
    time: "03 May 2026 18:18",
    type: "out",
    status: "completed",
  },
  {
    id: "7",
    merchant: "International Processing Fee",
    category: "Fees",
    amount: -2.0,
    date: "2026-05-03",
    time: "03 May 2026 04:20",
    type: "out",
    status: "completed",
  },
];

export default function AccountDetailScreen({
  accountId = "1",
  account,
}: AccountDetailScreenProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const defaultAccount: Account = {
    id: "1",
    name: "Main Account",
    type: "Cheque",
    availableBalance: 826.85,
    totalBalance: 1056.85,
    currency: "R",
    cardColor: colors.primary,
  };

  const currentAccount = account || defaultAccount;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(transaction);
    });

    return Object.entries(grouped).map(([month, transactions]) => ({
      title: month,
      data: transactions,
    }));
  };

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesFilter =
      selectedFilter === "all" ||
      selectedFilter === "track" ||
      transaction.type === (selectedFilter === "in" ? "in" : "out");

    const query = searchQuery.trim().toLowerCase();

    if (!matchesFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      transaction.merchant,
      transaction.category,
      transaction.date,
      transaction.time,
      transaction.type,
      transaction.status ?? "",
      Math.abs(transaction.amount).toFixed(2),
      `R${Math.abs(transaction.amount).toFixed(2)}`,
    ].some((value) => value.toLowerCase().includes(query));
  });

  const sections = groupTransactionsByMonth(filteredTransactions);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionDetails}>
          <Text style={styles.merchantName}>{item.merchant}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{item.time}</Text>
            {item.status === "pending" && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.pending}>(Pending)</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === "in" ? styles.amountPositive : styles.amountNegative,
        ]}
      >
        {item.type === "in" ? "+" : "-"}R{Math.abs(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={styles.monthHeader}>
      <Text style={styles.monthText}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.statementLink}>Statement</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentAccount.name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => {
                setSearchVisible(!searchVisible);
                if (searchVisible) {
                  setSearchQuery("");
                }
              }}
            >
              <Text style={styles.actionIcon}>{searchVisible ? "✕" : "🔍"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction}>
              <Text style={styles.actionIcon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {searchVisible && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search merchant, category, amount or date"
              placeholderTextColor="rgba(255, 255, 255, 0.65)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceAmount}>
              {currentAccount.currency}
              {currentAccount.availableBalance.toLocaleString("en-ZA")}
            </Text>
            <TouchableOpacity style={styles.infoIcon}>
              <Text style={styles.infoText}>ⓘ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalBalanceBox}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.totalBalance}>
              {currentAccount.currency}
              {currentAccount.totalBalance.toLocaleString("en-ZA")}
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {[
            { id: "all", label: "All" },
            { id: "in", label: "Money In" },
            { id: "out", label: "Money Out" },
            { id: "track", label: "Track" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {selectedFilter === filter.id && (
                <View style={styles.filterIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Transactions List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          scrollEnabled={true}
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.surface,
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerAction: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 4,
  },
  clearSearch: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 4,
  },

  // Balance Section
  balanceSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  balanceBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.surface,
    flex: 1,
    marginLeft: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: colors.surface,
  },
  totalBalanceBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalBalance: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.surface,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  filterTab: {
    paddingVertical: 14,
    position: "relative",
  },
  filterTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.surface,
    paddingBottom: 11,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  filterTextActive: {
    color: colors.surface,
    fontWeight: "600",
  },
  filterIndicator: {
    position: "absolute",
    bottom: -14,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.surface,
  },

  // List
  listContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyText: {
    marginTop: 28,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Month Header
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  statementLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  // Transaction Item
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDetails: {
    gap: 4,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  dot: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  pending: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  amountPositive: {
    color: colors.positive,
  },
  amountNegative: {
    color: colors.negative,
  },
});
