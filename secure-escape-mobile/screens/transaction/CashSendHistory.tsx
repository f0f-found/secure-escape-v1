import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
colors;
// import BottomNav from "../components/BottomNav";
import { colors } from "@/utils/theme";

// ---------- MOCK DATA (all redeemed) ----------
const generateMockTransactions = () => {
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
    100, 80, 280, 60, 60, 40, 150, 200, 90, 120, 75, 45, 110, 95, 130,
  ];
  return codes.map((code, idx) => ({
    id: idx.toString(),
    code,
    date: new Date(dates[idx % dates.length]),
    amount: amounts[idx % amounts.length],
    redeemed: true, // all redeemed
  }));
};

const allTransactions = generateMockTransactions();

export default function Screen_cashHistory() {
  const initialFilter = route.params?.initialFilter || "All";
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const filtered = allTransactions.filter((tx) => {
    if (activeFilter === "Redeemed") return tx.redeemed === true;
    if (activeFilter === "Unredeemed") return tx.redeemed === false;
    return true;
  });

  const groupByMonth = (transactions: string) => {
    const groups = {};
    transactions.forEach((tx) => {
      const monthYear = tx.date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(tx);
    });
    const sortedKeys = Object.keys(groups).sort(
      (a, b) => new Date(b) - new Date(a),
    );
    const sorted = {};
    sortedKeys.forEach((k) => {
      sorted[k] = groups[k];
    });
    return sorted;
  };

  const grouped = groupByMonth(filtered);

  const renderItem = ({ item }) => (
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
              { color: item.redeemed ? "#4CAF50" : "#FF6B6B" },
            ]}
          >
            {item.redeemed ? "Redeemed" : "Unredeemed"}
          </Text>
        </View>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>-R{item.amount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.detailBtn}>
          <Ionicons name="search-outline" size={18} color={colors.purple} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroup = (month, transactions) => (
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
      <Ionicons name="cash-outline" size={60} color="#ddd" />
      <Text style={styles.emptyText}>
        You have no {activeFilter.toLowerCase()} transactions.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        {/* Centered tabs */}
        <View style={styles.tabRow}>
          {["All", "Redeemed", "Unredeemed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeFilter === tab && styles.activeTab]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === tab && styles.activeTabText,
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
          {Object.keys(grouped).length === 0
            ? renderEmpty()
            : Object.keys(grouped).map((month) =>
                renderGroup(month, grouped[month]),
              )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center", // center tabs
    backgroundColor: "#f0f0f5",
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    alignSelf: "center", // center the pill
    minWidth: 200,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  activeTabText: { color: colors.primary },
  scrollContent: { paddingBottom: 40 },
  groupContainer: { marginBottom: 24 },
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
  historyLeft: { flex: 1 },
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
  detailBtn: { padding: 4 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: "#aaa",
    marginTop: 16,
  },
});
