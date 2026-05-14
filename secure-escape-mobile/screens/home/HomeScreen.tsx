import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";
import { colors, commonStyles, shadows } from "@/utils/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const accountCards = [
    {
      name: "Main Account",
      balance: 28840,
      icon: "wallet",
      gradient: ["#9F8FEF", "#7C6EF7"] as const,
      iconBg: "#9F8FEF20",
    },
    {
      name: "Savings Plans",
      balance: 3789,
      icon: "trending-up",
      gradient: ["#93C5FD", "#60A5FA"] as const,
      iconBg: "#60A5FA20",
    },
  ];

  const favourites = [
    { label: "Pay Beneficiary", icon: "people", bg: "#EEEEFF" },
    { label: "Transfer", icon: "swap-horizontal", bg: "#FFF0F5" },
    { label: "Send Cash", icon: "cash", bg: "#E6FAF8" },
    { label: "Buy Prepaid", icon: "phone-portrait", bg: "#FFFBEB" },
    { label: "Pay the bill", icon: "document-text", bg: "#F0FDF4" },
    { label: "Credit card", icon: "card", bg: "#FFF5F5" },
    { label: "Transaction report", icon: "stats-chart", bg: "#EEEEFF" },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Dashboard</Text>
        <Text style={styles.greeting}>Good afternoon, Naomie</Text>
      </View>

      {/* Account Cards with gradient background */}
      <View style={styles.cardsRow}>
        {accountCards.map((card, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.9}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.accountCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View
                style={[styles.iconCircle, { backgroundColor: card.iconBg }]}
              >
                <Ionicons
                  name={card.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.accName}>{card.name}</Text>
              <Text style={styles.accBalance}>
                R {card.balance.toLocaleString()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Favourites */}
      <View style={styles.favouritesSection}>
        <View style={styles.favouritesHeader}>
          <Text style={styles.favTitle}>Favourites</Text>
          <TouchableOpacity>
            <Text style={styles.editLink}>edit ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.favGrid}>
          {favourites.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.favTile}
              activeOpacity={0.7}
            >
              <View style={[styles.favIcon, { backgroundColor: item.bg }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.favLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyBg },
  scrollContent: {
    paddingBottom: 40, // extra space at bottom
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 80, // was 20 → now 48 (moves title down)
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800", color: colors.navy },
  greeting: { fontSize: 14, color: colors.textSub, marginTop: 6 },
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 8, // slight separation from header
    marginBottom: 28, // increased from 24 to 28
  },
  cardWrapper: { flex: 1 },
  accountCard: {
    borderRadius: 28,
    padding: 18,
    ...shadows.medium,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  accName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.9,
  },
  accBalance: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    marginTop: 6,
  },
  favouritesSection: {
    paddingHorizontal: 16,
    marginTop: 4, // reduced from 8 to avoid double spacing
  },
  favouritesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  favTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    opacity: 0.75,
  },
  favGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  favTile: {
    width: (width - 48) / 3,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14, // increased from 12 for better grid spacing
    ...shadows.medium,
  },
  favIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  favLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMain,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});
