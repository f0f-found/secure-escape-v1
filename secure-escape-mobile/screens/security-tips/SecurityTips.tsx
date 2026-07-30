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
    icon: "lock-closed-outline" as const,
    title: "Never share your PIN",
    body: "Not with family, not with bank staff, not with anyone claiming to be support. Your bank will never ask for your PIN over a call, message, or email.",
  },
  {
    icon: "eye-off-outline" as const,
    title: "Cover the keypad",
    body: "When entering your PIN at an ATM or in person, shield the keypad with your hand — even if you don't think anyone's watching.",
  },
  {
    icon: "alert-circle-outline" as const,
    title: "Be wary of urgency",
    body: "Scammers create pressure to make you act before you think. If a message or call insists you act immediately, pause and verify through a separate, trusted channel first.",
  },
  {
    icon: "phone-portrait-outline" as const,
    title: "Verify unexpected requests",
    body: "If someone unexpectedly asks you to send money or share account details, contact them directly through a known number, not one they've just given you.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Know your Secure Escape PIN",
    body: "If you're ever forced to transact under threat, your duress PIN quietly signals for help without anyone knowing. Make sure it's set up before you need it.",
  },
];

export default function SecurityTips() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Tips</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            Simple habits that make it much harder for anyone to compromise your
            account or catch you off guard.
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
});
