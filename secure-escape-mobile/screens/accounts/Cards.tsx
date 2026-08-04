// app/(tabs)/cards.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { getAccounts } from "@/services/accountService";
import { AccountResponse } from "@/types/account";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";

// Predefined gradients for card variety
const cardGradients: readonly (readonly [string, string])[] = [
  ["#6C63FF", "#4A3DB7"],
  ["#FF6B6B", "#C0392B"],
  ["#4ECDC4", "#1A8A7A"],
  ["#F7DC6F", "#D4AC0D"],
  ["#85C1E9", "#2471A3"],
];

export default function CardsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, profileData] = await Promise.all([
        getAccounts(),
        getProfileMe(),
      ]);
      setAccounts(accountsData);
      setProfile(profileData);
    } catch (error) {
      Alert.alert("Error", "Failed to load card data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (card: any) => {
  router.push({
    pathname: "/(tabs)/card-detail",
    params: { card: JSON.stringify(card) },
  });
};

  const handleAddCard = () => {
    Alert.alert("Coming Soon", "Add Entrepreneur Card feature will be available soon.");
  };

  // Build card data from accounts
  const cardsData = accounts.map((account, index) => {
    const gradientIndex = index % cardGradients.length;
    const displayNumber = account.accountNumber
      ? account.accountNumber.replace(/(\d{4})/g, "$1 ").trim()
      : "**** **** **** ****";
    const masked = account.accountNumber
      ? account.accountNumber.slice(0, 4) + " **** **** " + account.accountNumber.slice(-4)
      : "**** **** **** ****";

    return {
      id: account.id,
      type: account.accountName || "Bank Account",
      number: displayNumber,
      displayNumber: masked,
      status: account.status === "Active" ? "ACTIVE" : "INACTIVE",
      gradient: cardGradients[gradientIndex],
      bank: "CAPITEC",
      holder: profile?.fullName?.toUpperCase() || "ACCOUNT HOLDER",
      accountNumber: account.accountNumber || "",
      accountType: "SAVINGS ACCOUNT",
      expiry: "12/28", // Placeholder; could be derived if available
      cvv: "***",
    };
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Cards</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cardsData.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            onPress={() => handleCardPress(card)}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{card.type}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{card.status}</Text>
                </View>
              </View>
              <Text style={styles.cardNumber}>{card.displayNumber}</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardBank}>{card.bank}</Text>
                  <Text style={styles.cardHolder}>{card.holder}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountNumber}>{card.accountNumber}</Text>
                  <Text style={styles.accountType}>{card.accountType}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addCardText}>+ Add Entrepreneur Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textSub },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerLeft: { width: 40, alignItems: "flex-start" },
  headerRight: { width: 40 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  cardWrapper: { marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardType: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBank: { fontSize: 14, fontWeight: "600", color: "#fff", opacity: 0.9 },
  cardHolder: { fontSize: 12, fontWeight: "500", color: "#fff", opacity: 0.8, marginTop: 2 },
  accountInfo: { alignItems: "flex-end" },
  accountNumber: { fontSize: 13, fontWeight: "600", color: "#fff", opacity: 0.9 },
  accountType: { fontSize: 11, fontWeight: "500", color: "#fff", opacity: 0.7, marginTop: 2 },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 16,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 8,
  },
});