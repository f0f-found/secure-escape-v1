import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
import { createTransfer } from "@/services/transactionServices";
import { AccountResponse } from "@/types/account";
import { TransactionResponse } from "@/types/transaction";
import { colors } from "@/utils/theme";
import VerifyPinModal from "@/components/VerifyPinModal";

export default function CreateTransfer() {
  const router = useRouter();
  const { beneficiaryId, beneficiaryName, reference } = useLocalSearchParams<{
    beneficiaryId?: string;
    beneficiaryName?: string;
    reference?: string;
  }>();

  const [verifyVisible, setVerifyVisible] = useState(false);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState(reference ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [createdTransaction, setCreatedTransaction] =
    useState<TransactionResponse | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status === "Active"),
    [accounts],
  );

  const selectedAccount = activeAccounts.find(
    (account) => account.id === selectedAccountId,
  );

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

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
      showError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const numericAmount = Number(amount);

    if (!beneficiaryId) {
      showError("Please choose a beneficiary first.");
      return;
    }

    if (!selectedAccountId) {
      showError("Please choose an account.");
      return;
    }

    if (!amount.trim()) {
      showError("Please enter the amount you want to send.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      showError("Please enter a valid amount.");
      return;
    }

    if (!description.trim()) {
      showError("Please enter a payment reference.");
      return;
    }

    if (selectedAccount && numericAmount > selectedAccount.availableBalance) {
      showError("Insufficient funds. Please enter a lower amount.");
      return;
    }

    setVerifyVisible(true);
  };

  const handleVerifiedSubmit = async () => {
    setVerifyVisible(false);

    try {
      setSaving(true);
      clearError();
      const transaction = await createTransfer({
        bankAccountId: selectedAccountId,
        beneficiaryId: beneficiaryId!,
        amount: Number(amount),
        description: description.trim(),
      });

      if (transaction.status === "Failed" || transaction.status === "Blocked") {
        showError(
          transaction.statusReason ||
            "This transfer could not be processed. Please try a lower amount.",
        );
        return;
      }

      setCreatedTransaction(transaction);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Please try again.");
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
        <Text style={styles.headerTitle}>Bank Transfer</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.eyebrow}>Beneficiary</Text>
            <Text style={styles.summaryTitle}>
              {beneficiaryName || "Selected beneficiary"}
            </Text>
            {!!description && (
              <Text style={styles.summaryText}>{description}</Text>
            )}
          </View>

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
                onPress={() => {
                  setSelectedAccountId(account.id);
                  clearError();
                }}
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
            onChangeText={(value) => {
              setAmount(value);
              clearError();
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              clearError();
            }}
            placeholder="Payment reference"
            placeholderTextColor="#A0A4B8"
          />

          {error && (
            <TouchableOpacity
              style={styles.errorBanner}
              activeOpacity={0.8}
              onPress={() => setShowErrorModal(true)}
            >
              <Ionicons name="alert-circle" size={18} color="#B91C1C" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </TouchableOpacity>
          )}

          {createdTransaction && (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Transfer submitted</Text>
              <Text style={styles.successText}>
                Status: {createdTransaction.status} • Ref:{" "}
                {createdTransaction.bankReference}
              </Text>
              {!!createdTransaction.secureEscapeCode && (
                <Text style={styles.successText}>
                  Secure Escape code: {createdTransaction.secureEscapeCode}
                </Text>
              )}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {!createdTransaction && (
            <TouchableOpacity
              style={[styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Send transfer</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        onVerified={handleVerifiedSubmit}
        subtitle="Enter your PIN to send this transfer"
      />
      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="alert-circle" size={30} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>Transfer failed</Text>
            <Text style={styles.modalMessage}>{error}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  eyebrow: { fontSize: 12, fontWeight: "700", color: colors.textSub },
  summaryTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
  },
  summaryText: { marginTop: 4, fontSize: 13, color: colors.textSub },
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
  },
  errorBannerText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },
  modalMessage: {
    marginTop: 8,
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
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
