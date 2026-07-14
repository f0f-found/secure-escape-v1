import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/utils/theme";

export default function TransactionChoice() {
  const router = useRouter();
  const { beneficiaryId, beneficiaryName, reference } = useLocalSearchParams<{
    beneficiaryId?: string;
    beneficiaryName?: string;
    reference?: string;
  }>();

  const transferParams = {
    beneficiaryId: beneficiaryId ?? "",
    beneficiaryName: beneficiaryName ?? "",
    reference: reference ?? "",
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Payment</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        {!!beneficiaryName && (
          <View style={styles.beneficiaryCard}>
            <Text style={styles.eyebrow}>Paying</Text>
            <Text style={styles.beneficiaryName}>{beneficiaryName}</Text>
            {!!reference && <Text style={styles.reference}>{reference}</Text>}
          </View>
        )}

        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/transactions/create-transfer",
              params: transferParams,
            })
          }
        >
          <View style={styles.iconCircle}>
            <Ionicons name="swap-horizontal" size={26} color={colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Bank transfer</Text>
            <Text style={styles.optionDesc}>Send money to this beneficiary.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7CAD6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/transactions/create-cash-send",
              params: {
                reference: reference ?? "",
              },
            })
          }
        >
          <View style={styles.iconCircle}>
            <Ionicons name="cash-outline" size={26} color={colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Cash send</Text>
            <Text style={styles.optionDesc}>Create a cash voucher and PIN.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7CAD6" />
        </TouchableOpacity>
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
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
  },
  beneficiaryCard: {
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  eyebrow: { fontSize: 12, fontWeight: "700", color: colors.textSub },
  beneficiaryName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    marginTop: 4,
  },
  reference: { marginTop: 4, fontSize: 13, color: colors.textSub },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: "800", color: colors.navy },
  optionDesc: { fontSize: 12, color: colors.textSub, marginTop: 3 },
});
