import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";

const { width } = Dimensions.get("window");

const colors = {
  primary: "#5856D6",
  primaryDark: "#4338CA",
  secondary: "#FF6B6B",
  accent: "#00D4FF",
  background: "#FAFBFC",
  surface: "#FFFFFF",
  text: "#1A202C",
  textSecondary: "#718096",
  textTertiary: "#A0AEC0",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
};

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  cardColor: string;
}

interface FavoriteAction {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const accounts: Account[] = [
  {
    id: "1",
    name: "Cheque Account",
    type: "Primary",
    balance: 45230.5,
    currency: "ZAR",
    cardColor: colors.primary,
  },
  {
    id: "2",
    name: "Savings Account",
    type: "Secondary",
    balance: 125000.0,
    currency: "ZAR",
    cardColor: colors.success,
  },
  {
    id: "3",
    name: "Investment Account",
    type: "Growth",
    balance: 287500.75,
    currency: "ZAR",
    cardColor: colors.accent,
  },
];

const favoriteActions: FavoriteAction[] = [
  {
    id: "airtime",
    name: "Buy Airtime",
    icon: "📱",
    color: "#FF6B6B",
  },
  {
    id: "electricity",
    name: "Buy Electricity",
    icon: "⚡",
    color: "#F59E0B",
  },
  {
    id: "beneficiary",
    name: "Pay Beneficiary",
    icon: "👤",
    color: "#5856D6",
  },
  {
    id: "transfer",
    name: "Transfer Money",
    icon: "💰",
    color: "#10B981",
  },
  {
    id: "track",
    name: "Track Money",
    icon: "📍",
    color: "#3B82F6",
  },
  {
    id: "payshap",
    name: "PayShap",
    icon: "📲",
    color: "#EC4899",
  },
];

interface HomeScreenProps {
  onActionPress?: (actionId: string) => void;
}

export default function HomeScreen({ onActionPress }: HomeScreenProps) {
  const [expandedAccount, setExpandedAccount] = useState<string | null>(
    accounts[0].id,
  );
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfileMe();
        setProfile(profileData);
      } catch (error) {
        console.log("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleActionPress = (actionId: string) => {
    onActionPress?.(actionId);
  };
  const handleAccountPress = (accountId: string) => {
    router.push(`/accounts/${accountId}`);
  };

  const renderAccountCard = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={[styles.accountCard, { backgroundColor: item.cardColor }]}
      onPress={() => handleAccountPress(item.id)}
      activeOpacity={0.85}
    >
      <View style={styles.accountCardContent}>
        <View>
          <Text style={styles.accountType}>{item.type}</Text>
          <Text style={styles.accountName}>{item.name}</Text>
        </View>
        <TouchableOpacity style={styles.accountMenu}>
          <Text style={styles.accountMenuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.accountBalanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          {item.currency} {item.balance.toLocaleString("en-ZA")}
        </Text>
      </View>

      <View style={styles.accountFooter}>
        <View style={styles.accountChip}>
          <Text style={styles.chipLabel}>●●●●</Text>
          <Text style={styles.chipNumber}>2847</Text>
        </View>
        <View>
          <Text style={styles.cardBrand}>VISA</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFavoriteAction = ({ item }: { item: FavoriteAction }) => (
    <TouchableOpacity
      style={styles.actionTile}
      onPress={() => handleActionPress(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.actionIconBox, { backgroundColor: item.color + "20" }]}
      >
        <Text style={styles.actionIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.actionName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.greetingName}>
              {profile?.fullName ?? "Secure Escape User"}
            </Text>
            <Text style={styles.greetingEmail}>
              {profile?.email ?? "Loading profile..."}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileInitial}>
              {(profile?.fullName ?? "S").charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Accounts Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Accounts</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={accounts}
            renderItem={renderAccountCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </Animated.View>

        {/* CTA Tile - Explore Products & Benefits */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.ctaTile}
            activeOpacity={0.8}
            onPress={() => console.log("Explore products")}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaIcon}>🎁</Text>
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>Explore Products & Benefits</Text>
                <Text style={styles.ctaSubtitle}>
                  Discover exclusive offers tailored for you
                </Text>
              </View>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Favorite Actions Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Favorite Actions</Text>

          <View style={styles.actionGrid}>
            {favoriteActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionTile}
                onPress={() => handleActionPress(action.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconBox,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionName}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>This Month</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💸</Text>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>R 12,450</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statLabel}>Received</Text>
              <Text style={styles.statValue}>R 25,000</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  greetingEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  greetingName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.surface,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  // Account Card
  accountCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  accountCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  accountType: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
  },
  accountMenu: {
    padding: 8,
  },
  accountMenuIcon: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.8)",
  },
  accountBalanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 1)",
    letterSpacing: -0.5,
  },
  accountFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  chipNumber: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    letterSpacing: 2,
  },
  cardBrand: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "700",
    letterSpacing: 1,
  },

  // CTA Tile
  ctaTile: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  ctaIcon: {
    fontSize: 32,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  ctaArrow: {
    fontSize: 20,
    marginLeft: 8,
  },

  // Action Grid
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionTile: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    lineHeight: 16,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
});
