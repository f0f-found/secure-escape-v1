import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

const TIPS = [
  {
    icon: "wallet-outline" as const,
    title: "Pay yourself first",
    body: "Before spending on anything else, move a small amount into savings the moment you get paid. Even a fixed R100 a month adds up faster than waiting for 'leftover' money.",
  },
  {
    icon: "repeat-outline" as const,
    title: "Automate what you can",
    body: "Set up automatic transfers for savings, debt payments, or recurring bills. Decisions you don't have to make every month are decisions you can't forget or talk yourself out of.",
  },
  {
    icon: "list-outline" as const,
    title: "Track before you cut",
    body: "Before trying to spend less, just look at where money actually goes for a month. Most people are surprised by one or two categories — that's usually the easiest place to start.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Build a small buffer first",
    body: "A small emergency fund — even a few hundred rand — means one unexpected expense doesn't have to become debt. Build this before tackling bigger financial goals.",
  },
  {
    icon: "trending-up-outline" as const,
    title: "Small habits compound",
    body: "Consistency beats intensity. Saving a little every month for years outperforms saving a lot for a few months and stopping.",
  },
];

export default function FinancialAdvice() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Tips</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            A few general habits that help most people manage money better — not
            a full financial plan, just good starting points.
          </Text>

          {TIPS.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.tipTextGroup}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.disclaimer}>
            These are general tips, not personalised financial advice. For
            guidance specific to your situation, consider speaking to a
            qualified financial advisor.
          </Text>
        </ScrollView>
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
    paddingTop: 60,
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
  intro: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 19,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: "row",
    marginBottom: 18,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipTextGroup: { flex: 1 },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 4,
  },
  tipBody: { fontSize: 13, color: colors.textSub, lineHeight: 19 },
  disclaimer: {
    fontSize: 11,
    color: "#aaa",
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 20,
    fontStyle: "italic",
  },
});
