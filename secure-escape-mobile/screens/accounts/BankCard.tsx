import React, { useCallback, useEffect, useState } from "react";
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
import { colors, shadows } from "@/utils/theme";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getCards } from "@/services/cardService";
import { CardResponse } from "@/types/card";

// Each card still needs a gradient — the API response won't carry UI-only
// values like this, so we assign one based on index/type once fetched.
const CARD_GRADIENTS: readonly [string, string][] = [
  ["#6C63FF", "#4A3DB7"],
  ["#FF6B6B", "#C0392B"],
];

export default function Screen_Cards() {
  const router = useRouter();
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  // Matches the refresh-on-focus pattern used on HomeScreen
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, []),
  );

  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCards();

      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (card: CardResponse) => {
    router.push({
      pathname: "/cards/card-detail",
      params: { id: card.id },
    });
  };

  const handleAddCard = () => {
    Alert.alert(
      "Coming Soon",
      "Add Entrepreneur Card feature will be available soon.",
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <Text style={styles.headerTitle}>Cards</Text>
        <Text style={styles.headerTab}>Virtual</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        )}

        {error && (
          <TouchableOpacity onPress={loadCards}>
            <Text style={styles.errorText}>{error}</Text>
          </TouchableOpacity>
        )}

        {!isLoading && !error && cards.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={40} color={colors.greyLine} />
            <Text style={styles.emptyText}>No cards found</Text>
          </View>
        )}

        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            onPress={() => handleCardPress(card)}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
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
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.addCardText}>+ Add Entrepreneur Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyBg ?? "#f5f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerTab: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  cardWrapper: { marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: colors.white },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBank: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.9,
  },
  cardHolder: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  accountInfo: { alignItems: "flex-end" },
  accountNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.9,
  },
  accountType: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.greyLine ?? "#ddd",
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  errorText: {
    marginTop: 20,
    marginBottom: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
