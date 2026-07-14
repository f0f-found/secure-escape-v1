import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAccounts } from "@/services/accountService";
import { createCashSend } from "@/services/transactionServices";
import { AccountResponse } from "@/types/account";
import { CashSendResponse } from "@/types/transaction";
import { colors } from "@/utils/theme";

export default function CreateCashSend() {
  const router = useRouter();
  const { reference } = useLocalSearchParams<{ reference?: string }>();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [voucherPin, setVoucherPin] = useState("");
  const [description, setDescription] = useState(reference ?? "Cash send");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createdCashSend, setCreatedCashSend] =
    useState<CashSendResponse | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status === "Active"),
    [accounts],
  );

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);

      const firstActive = data.find((account) => account.status === "Active");
      if (firstActive) {
        setSelectedAccountId(firstActive.id);
      }
    } catch (err) {
      Alert.alert(
        "Could not load accounts",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);

    if (!selectedAccountId) {
      Alert.alert("Missing account", "Please choose an account.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    if (voucherPin.length < 4 || voucherPin.length > 6) {
      Alert.alert("Invalid PIN", "Cash send PIN must be 4 to 6 digits.");
      return;
    }

    try {
      setSaving(true);
      const cashSend = await createCashSend({
        bankAccountId: selectedAccountId,
        amount: numericAmount,
        voucherPin,
        description: description.trim(),
      });

      setCreatedCashSend(cashSend);
    } catch (err) {
      Alert.alert(
        "Cash send failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cash Send</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>From account</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            activeAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountRow,
                  selectedAccountId === account.id && styles.selectedRow,
                ]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <View>
                  <Text style={styles.accountName}>{account.accountName}</Text>
                  <Text style={styles.accountMeta}>
                    {account.accountNumber} • R{" "}
                    {account.availableBalance.toLocaleString()}
                  </Text>
                </View>
                {selectedAccountId === account.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Cash send PIN</Text>
          <TextInput
            style={styles.input}
            value={voucherPin}
            onChangeText={setVoucherPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="4 to 6 digits"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Cash send reference"
            placeholderTextColor="#A0A4B8"
          />

          {createdCashSend && (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Cash send created</Text>
              <Text style={styles.successText}>
                Voucher number: {createdCashSend.voucherNumber}
              </Text>
              <Text style={styles.successText}>
                Status: {createdCashSend.status} • Ref:{" "}
                {createdCashSend.bankReference}
              </Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {!createdCashSend && (
            <TouchableOpacity
              style={[styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Create cash send</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 8,
    marginTop: 14,
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E6F0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selectedRow: { borderColor: colors.primary, backgroundColor: "#F5F3FF" },
  accountName: { fontSize: 15, fontWeight: "800", color: colors.navy },
  accountMeta: { marginTop: 3, fontSize: 12, color: colors.textSub },
  input: {
    borderWidth: 1,
    borderColor: "#E2E6F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.navy,
    backgroundColor: "#F8F9FC",
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  successBox: {
    marginTop: 22,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successTitle: { fontSize: 16, fontWeight: "800", color: "#166534" },
  successText: { marginTop: 4, fontSize: 13, color: "#3F6212" },
  doneButton: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
