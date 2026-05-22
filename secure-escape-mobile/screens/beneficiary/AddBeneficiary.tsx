// screens/Screen12_AddBeneficiaryOptions.js – with alerts and bank account navigation
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

export default function AddBeneficiaryOptions() {
  const router = useRouter();
  const options = [
    {
      title: "Capitec cellphone",
      desc: "Pay to Capitec client’s cellphone number",
      icon: "call-outline",
      action: "navigate",
      route: "/AddBeneficiaryForm",
    },
    {
      title: "Capitec Registered",
      desc: "Dstv, Telkom, Mr Price, credit card, etc.",
      icon: "card-outline",
      action: "alert",
      message:
        "Capitec Registered payments will be available in the next sprint.",
    },
    {
      title: "Bank Account",
      desc: "Enter beneficiary’s details",
      icon: "business-outline",
      action: "navigate",
      route: "/addBankAccount",
    },
  ];

  type BeneficiaryOption = {
    title: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: "navigate" | "alert";
    route?: string;
    message?: string;
  };

  const handlePress = (opt: BeneficiaryOption) => {
    if (opt.action === "navigate" && opt.route) {
      router.push(opt.route);
    } else if (opt.action === "alert" && opt.message) {
      Alert.alert("Coming Soon", opt.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Beneficiary</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.optionCard}
            onPress={() => handlePress(opt)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={opt.icon} size={28} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
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
    padding: 24,
    marginTop: -20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  optionDesc: { fontSize: 12, color: colors.textSub, marginTop: 2 },
});
