// app/beneficiaries/beneficiary-list.tsx
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
import { getBeneficiaries } from "@/services/beneficiaryService";
import { BeneficiaryResponse } from "@/types/beneficiary";

export default function BeneficiaryList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Frequent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  type SortOption = "Recently paid" | "Recently added";
  const [sortBy, setSortBy] = useState<SortOption>("Recently paid");

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBeneficiaries();
      setBeneficiaries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load beneficiaries."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBeneficiaries();
    }, [])
  );

  const visibleList = showAll ? beneficiaries : beneficiaries.slice(0, 5);

  const sortedData = [...visibleList].sort((a, b) => {
    if (sortBy === "Recently added") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return (
      new Date(b.lastPaidAt ?? 0).getTime() -
      new Date(a.lastPaidAt ?? 0).getTime()
    );
  });

  const filteredData = sortedData.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      item.name,
      item.bankName,
      item.accountNumber,
      item.reference,
      item.status,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const formatLastPaid = (lastPaidAt?: string | null) => {
    if (!lastPaidAt) return "Never paid";
    const paidDate = new Date(lastPaidAt);
    const now = new Date();
    const diffMs = now.getTime() - paidDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Paid today";
    if (diffDays === 1) return "Paid yesterday";
    if (diffDays < 7) return `Paid ${diffDays} days ago`;
    return `Last paid ${paidDate.toLocaleDateString()}`;
  };

  const renderItem = ({ item }: { item: BeneficiaryResponse }) => (
    <TouchableOpacity
      style={styles.beneficiaryRow}
      onPress={() =>
        router.push({
          pathname: "/transactions/create-transaction",
          params: {
            beneficiaryId: item.id,
            beneficiaryName: item.name,
            reference: item.reference,
          },
        })
      }
    >
      <View style={styles.initialsCircle}>
        <Text style={styles.initialsText}>
          {item.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"}
        </Text>
      </View>
      <View style={styles.beneficiaryInfo}>
        <Text style={styles.beneficiaryName}>{item.name || "Unknown"}</Text>
        <Text style={styles.lastPaid}>
          {item.bankName} • {item.accountNumber}
        </Text>
        <Text style={styles.lastPaid}>{formatLastPaid(item.lastPaidAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Beneficiary</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
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
              placeholder="Search beneficiaries"
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              maxLength={15}
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/beneficiaries/add-beneficiary")}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          <View style={styles.sortItem}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <TouchableOpacity
              style={styles.sortValue}
              onPress={() =>
                setSortBy((current) =>
                  current === "Recently paid"
                    ? "Recently added"
                    : "Recently paid"
                )
              }
            >
              <Text style={styles.sortText}>{sortBy}</Text>
              <Ionicons name="swap-vertical" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            onPress={() => {
              setActiveTab("Frequent");
              setShowAll(true);
            }}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
          </TouchableOpacity>
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
                ? "No beneficiaries match your search"
                : "No beneficiaries found"}
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
    paddingTop: 80, 
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
  },
  addButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sortItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  sortLabel: { fontSize: 13, color: colors.textSub },
  sortValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sortText: { fontSize: 13, fontWeight: "500", color: colors.primary },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "flex-start", 
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  activeTabText: { color: colors.primary },
  listContent: { paddingBottom: 40 },
  beneficiaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  initialsText: { fontSize: 16, fontWeight: "700", color: colors.primary },
  beneficiaryInfo: { flex: 1 },
  beneficiaryName: { fontSize: 15, fontWeight: "600", color: colors.navy },
  lastPaid: { fontSize: 12, color: "#888", marginTop: 2 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#aaa" },
});