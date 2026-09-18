import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors } from "@/utils/theme";

type CashSendFilter = "All" | "Redeemed" | "Unredeemed";

type CashSendTransaction = {
  id: string;
  code: string;
  date: Date;
  amount: number;
  redeemed: boolean;
};

type GroupedTransactions = Record<string, CashSendTransaction[]>;

// Temporary screen data.
// This screen is not yet connected to a Cash Send history API.
const generateMockTransactions = (): CashSendTransaction[] => {
  const codes = [
    "C2958464139",
    "C3659407088",
    "C7837358089",
    "C4650940341",
    "C5448933886",
    "C3777415047",
    "C9123456789",
    "C8234567890",
    "C7345678901",
    "C6456789012",
    "C5567890123",
    "C4678901234",
    "C3789012345",
    "C2890123456",
    "C1901234567",
  ];

  const dates = [
    "2026-07-02T10:00:00Z",
    "2026-07-02T14:30:00Z",
    "2026-06-17T09:15:00Z",
    "2026-06-04T11:45:00Z",
    "2026-05-20T16:20:00Z",
    "2026-05-10T08:05:00Z",
    "2026-07-01T12:00:00Z",
    "2026-06-28T07:30:00Z",
    "2026-05-30T18:10:00Z",
    "2026-04-15T13:40:00Z",
    "2026-07-05T09:00:00Z",
    "2026-06-20T10:30:00Z",
    "2026-05-25T14:15:00Z",
    "2026-04-30T12:00:00Z",
    "2026-03-15T16:45:00Z",
  ];

  const amounts = [
    100,
    80,
    280,
    60,
    60,
    40,
    150,
    200,
    90,
    120,
    75,
    45,
    110,
    95,
    130,
  ];

  return codes.map((code, index) => ({
    id: index.toString(),
    code,
    date: new Date(dates[index % dates.length]),
    amount: amounts[index % amounts.length],
    redeemed: true,
  }));
};

const allTransactions = generateMockTransactions();

function isCashSendFilter(value: string | string[] | undefined): value is CashSendFilter {
  return (
    typeof value === "string" &&
    (value === "All" ||
      value === "Redeemed" ||
      value === "Unredeemed")
  );
}

function groupByMonth(
  transactions: CashSendTransaction[],
): GroupedTransactions {
  const groups: GroupedTransactions = {};

  transactions.forEach((transaction) => {
    const monthYear = transaction.date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }

    groups[monthYear].push(transaction);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const aDate = groups[a][0]?.date.getTime() ?? 0;
    const bDate = groups[b][0]?.date.getTime() ?? 0;

    return bDate - aDate;
  });

  const sortedGroups: GroupedTransactions = {};

  sortedKeys.forEach((key) => {
    sortedGroups[key] = groups[key];
  });

  return sortedGroups;
}

export default function ScreenCashHistory() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    initialFilter?: string | string[];
  }>();

  const initialFilter: CashSendFilter = isCashSendFilter(
    params.initialFilter,
  )
    ? params.initialFilter
    : "All";

  const [activeFilter, setActiveFilter] =
    useState<CashSendFilter>(initialFilter);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      if (activeFilter === "Redeemed") {
        return transaction.redeemed;
      }

      if (activeFilter === "Unredeemed") {
        return !transaction.redeemed;
      }

      return true;
    });
  }, [activeFilter]);

  const groupedTransactions = useMemo(
    () => groupByMonth(filteredTransactions),
    [filteredTransactions],
  );

  const renderItem = ({
    item,
  }: {
    item: CashSendTransaction;
  }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyCode}>{item.code}</Text>

        <View style={styles.historyMeta}>
          <Text style={styles.historyDate}>
            {item.date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })}
          </Text>

          <Text
            style={[
              styles.historyStatus,
              item.redeemed
                ? styles.redeemedStatus
                : styles.unredeemedStatus,
            ]}
          >
            {item.redeemed ? "Redeemed" : "Unredeemed"}
          </Text>
        </View>
      </View>

      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>
          -R{item.amount.toFixed(2)}
        </Text>

        <View style={styles.detailBtn}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.primary}
          />
        </View>
      </View>
    </View>
  );

  const renderGroup = (
    month: string,
    transactions: CashSendTransaction[],
  ) => (
    <View key={month} style={styles.groupContainer}>
      <Text style={styles.monthHeader}>{month}</Text>

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
      <Ionicons
        name="cash-outline"
        size={60}
        color={colors.greyLine}
      />

      <Text style={styles.emptyText}>
        You have no {activeFilter.toLowerCase()} transactions.
      </Text>
    </View>
  );

  const filters: CashSendFilter[] = [
    "All",
    "Redeemed",
    "Unredeemed",
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>History</Text>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.tabRow}>
          {filters.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeFilter === tab && styles.activeTab,
              ]}
              onPress={() => setActiveFilter(tab)}
              accessibilityRole="button"
              accessibilityState={{
                selected: activeFilter === tab,
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === tab &&
                    styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {Object.keys(groupedTransactions).length === 0
            ? renderEmpty()
            : Object.entries(groupedTransactions).map(
                ([month, transactions]) =>
                  renderGroup(month, transactions),
              )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f0f0f5",
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    alignSelf: "center",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  groupContainer: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f5",
  },
  historyLeft: {
    flex: 1,
  },
  historyCode: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    letterSpacing: 0.5,
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  historyDate: {
    fontSize: 12,
    color: "#999",
  },
  historyStatus: {
    fontSize: 11,
    fontWeight: "500",
  },
  redeemedStatus: {
    color: "#4CAF50",
  },
  unredeemedStatus: {
    color: "#FF6B6B",
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  detailBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: "#aaa",
    marginTop: 16,
    textAlign: "center",
  },
});