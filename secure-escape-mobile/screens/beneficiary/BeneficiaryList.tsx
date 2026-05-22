// screens/Screen11_BeneficiaryList.js – with BottomNav, no SafeAreaView
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

type Beneficiary = {
  id: string;
  initials: string;
  name: string;
  lastPaid: string;
};

// Mock data (unchanged)
const frequentBeneficiariesAll = [
  { id: "1", initials: "O", name: "O", lastPaid: "15 May 2026 14:19" },
  { id: "2", initials: "R", name: "Rend", lastPaid: "11 May 2026 19:48" },
  {
    id: "3",
    initials: "CS",
    name: "CORNERSTONE SPACES PTY LTD",
    lastPaid: "02 May 2026 13:26",
  },
  { id: "4", initials: "N", name: "Ns", lastPaid: "16 Apr 2026 18:24" },
  { id: "5", initials: "M", name: "Munetsi", lastPaid: "09 Apr 2026 17:26" },
  { id: "6", initials: "R", name: "Remmie", lastPaid: "25 Mar 2026 17:50" },
  {
    id: "7",
    initials: "JP",
    name: "Jabu Pienaar",
    lastPaid: "20 Mar 2026 11:02",
  },
  { id: "8", initials: "LM", name: "Lebo M", lastPaid: "18 Mar 2026 09:33" },
  { id: "9", initials: "TK", name: "Thabo K", lastPaid: "10 Mar 2026 15:44" },
  { id: "10", initials: "NS", name: "Nomsa S", lastPaid: "05 Mar 2026 08:20" },
];

const oneTimeBeneficiariesAll = [
  { id: "11", initials: "JD", name: "John Doe", lastPaid: "10 May 2026 09:15" },
  {
    id: "12",
    initials: "AB",
    name: "Alice Brown",
    lastPaid: "05 May 2026 12:30",
  },
  {
    id: "13",
    initials: "MC",
    name: "Mike Chen",
    lastPaid: "28 Apr 2026 10:00",
  },
  {
    id: "14",
    initials: "SG",
    name: "Sarah Green",
    lastPaid: "22 Apr 2026 16:45",
  },
  {
    id: "15",
    initials: "PW",
    name: "Peter White",
    lastPaid: "15 Apr 2026 08:12",
  },
  { id: "16", initials: "LJ", name: "Linda J", lastPaid: "12 Apr 2026 13:30" },
];

export default function BeneficiaryList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Frequent");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recently paid");
  const [showAll, setShowAll] = useState(true);

  const fullList =
    activeTab === "Frequent"
      ? frequentBeneficiariesAll
      : oneTimeBeneficiariesAll;
  const visibleList = showAll ? fullList : fullList.slice(0, 5);
  const filteredData = visibleList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Beneficiary }) => (
    <TouchableOpacity
      style={styles.beneficiaryRow}
      onPress={() => router.push("/")}
    >
      <View style={styles.initialsCircle}>
        <Text style={styles.initialsText}>{item.initials || "?"}</Text>
      </View>
      <View style={styles.beneficiaryInfo}>
        <Text style={styles.beneficiaryName}>{item.name || "Unknown"}</Text>
        <Text style={styles.lastPaid}>Last paid: {item.lastPaid || "N/A"}</Text>
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
            />
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
            <TouchableOpacity style={styles.sortValue}>
              <Text style={styles.sortText}>{sortBy}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.sortItem}>
            <Text style={styles.sortLabel}>Show all</Text>
            <TouchableOpacity
              style={styles.sortValue}
              onPress={() => setShowAll(!showAll)}
            >
              <Text style={styles.sortText}>{showAll ? "▼" : "▶"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Frequent" && styles.activeTab]}
            onPress={() => {
              setActiveTab("Frequent");
              setShowAll(true);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Frequent" && styles.activeTabText,
              ]}
            >
              Frequent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "One time" && styles.activeTab]}
            onPress={() => {
              setActiveTab("One time");
              setShowAll(true);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "One time" && styles.activeTabText,
              ]}
            >
              One time
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No beneficiaries found</Text>
          }
        />
      </View>
    </View>
  );
}

// styles unchanged – same as you already have (just remove SafeAreaView wrapper)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
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
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
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
