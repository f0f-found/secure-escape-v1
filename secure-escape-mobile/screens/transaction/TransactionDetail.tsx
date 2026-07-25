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
import { useRouter, useLocalSearchParams } from "expo-router";
import { TransactionResponse } from "@/types/transaction";

const TYPE_META: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    bg: string;
    color: string;
  }
> = {
  Transfer: {
    icon: "swap-horizontal",
    label: "Transfer",
    bg: "#EDE9FE",
    color: colors.primary,
  },
  CashVoucher: {
    icon: "cash-outline",
    label: "Cash Send",
    bg: "#E6F7EE",
    color: "#1FA971",
  },
};

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Approved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" },
  DecoyApproved: { label: "Approved", bg: "#E6F7EE", color: "#1FA971" }, // indistinguishable by design
  Failed: { label: "Failed", bg: "#FDECEC", color: "#E5484D" },
  Pending: { label: "Pending", bg: "#FFF6E5", color: "#B98900" },
  Blocked: { label: "Blocked", bg: "#FDECEC", color: "#E5484D" },
  Delayed: { label: "Delayed", bg: "#FFF6E5", color: "#B98900" },
};

export default function TransactionDetail() {
  const router = useRouter();
  const { transaction } = useLocalSearchParams<{ transaction: string }>();

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Transaction not found.</Text>
      </View>
    );
  }

  const item: TransactionResponse = JSON.parse(transaction);
  const typeMeta = TYPE_META[item.transactionType] ?? {
    icon: "receipt-outline",
    label: "Transaction",
    bg: "#F0F0F0",
    color: "#888",
  };
  const statusMeta = STATUS_META[item.status] ?? {
    label: "Unknown",
    bg: "#F0F0F0",
    color: "#888",
  };

  const formatAmount = (amount: number, currency: string) =>
    `${currency === "ZAR" ? "R" : currency} ${amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) =>
    value ? (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summary}>
            <View style={[styles.iconCircle, { backgroundColor: typeMeta.bg }]}>
              <Ionicons name={typeMeta.icon} size={28} color={typeMeta.color} />
            </View>
            <Text style={styles.amount}>
              {formatAmount(item.amount, item.currency)}
            </Text>
            <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
              <Text style={[styles.badgeText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Type" value={typeMeta.label} />
          <DetailRow label="Beneficiary" value={item.beneficiaryName} />
          <DetailRow label="Reference" value={item.bankReference} />
          <DetailRow label="Description" value={item.description} />
          <DetailRow label="Date" value={formatDateTime(item.createdAt)} />
          {item.voucherNumber && (
            <DetailRow label="Voucher Number" value={item.voucherNumber} />
          )}
          {item.voucherExpiresAt && (
            <DetailRow
              label="Voucher Expires"
              value={formatDateTime(item.voucherExpiresAt)}
            />
          )}
          {item.voucherNumber && (
            <DetailRow
              label="Voucher Redeemed"
              value={item.voucherRedeemed ? "Yes" : "No"}
            />
          )}
          {item.statusReason && (
            <DetailRow label="Status Reason" value={item.statusReason} />
          )}
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
  summary: { alignItems: "center", paddingVertical: 20 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  amount: { fontSize: 26, fontWeight: "800", color: colors.navy },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: { fontSize: 13, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 8 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailLabel: { fontSize: 13, color: "#888" },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    flexShrink: 1,
    textAlign: "right",
  },
  emptyText: { textAlign: "center", marginTop: 40, color: "#aaa" },
});
