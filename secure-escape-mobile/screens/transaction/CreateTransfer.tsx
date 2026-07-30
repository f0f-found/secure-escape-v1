// app/transactions/create-transfer.tsx
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
  FlatList,
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

// Validation helpers
const validateDescription = (desc: string): string => {
  const trimmed = desc.trim();
  if (!trimmed) return "Reference is required";
  if (trimmed.length < 2) return "Minimum 2 characters";
  if (trimmed.length > 50) return "Maximum 50 characters";
  if (!/^[A-Za-z0-9\s\-_]+$/.test(trimmed))
    return "Only letters, numbers, spaces, hyphens, underscores";
  return "";
};

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

  // UI‑only states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [notification, setNotification] = useState("None"); // UI only

  // Field errors for live feedback
  const [amountError, setAmountError] = useState("");
  const [descError, setDescError] = useState("");

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

  // Amount handling – clear if exceeds balance
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    if ((cleaned.match(/\./g) || []).length > 1) return;

    const numeric = parseFloat(cleaned);
    if (!isNaN(numeric) && numeric < 0) {
      cleaned = "0";
    }

    if (selectedAccount && !isNaN(numeric) && numeric > selectedAccount.availableBalance) {
      setAmount("");
      setAmountError(`Amount exceeds available balance of R ${selectedAccount.availableBalance.toLocaleString()}`);
      clearError();
      return;
    }

    setAmount(cleaned);
    validateAmount(cleaned);
    clearError();
  };

  const validateAmount = (value: string) => {
    const numeric = parseFloat(value);
    if (!value.trim()) {
      setAmountError("Amount is required");
      return false;
    }
    if (isNaN(numeric) || numeric <= 0) {
      setAmountError("Enter a valid amount");
      return false;
    }
    if (selectedAccount && numeric > selectedAccount.availableBalance) {
      setAmountError(`Exceeds balance of R ${selectedAccount.availableBalance.toLocaleString()}`);
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setDescError(validateDescription(text));
    clearError();
  };

  const validateAll = (): boolean => {
    const amountValid = validateAmount(amount);
    const descErr = validateDescription(description);
    setDescError(descErr);
    if (!beneficiaryId) {
      showError("Please choose a beneficiary first.");
      return false;
    }
    if (!selectedAccountId) {
      showError("Please choose an account.");
      return false;
    }
    return amountValid && !descErr;
  };

  const handlePayPress = () => {
    if (!validateAll()) {
      const firstError = amountError || descError || "Please correct the highlighted fields.";
      showError(firstError);
      return;
    }

    const numericAmount = parseFloat(amount);
    const balance = selectedAccount?.availableBalance || 0;

    // Check if amount > 80% of balance → go to selfie verification
    if (numericAmount > 0.8 * balance) {
      router.push({
        pathname: "/transactions/selfie-verification",
        params: {
          beneficiaryId: beneficiaryId!,
          beneficiaryName: beneficiaryName || "Beneficiary",
          reference: description.trim() || reference || "",
          amount: numericAmount.toString(),
          accountId: selectedAccountId,
          accountName: selectedAccount?.accountName || "",
        },
      });
      return;
    }

    // Otherwise show confirmation modal (first‑time beneficiary)
    setConfirmModalVisible(true);
  };

  const confirmPayment = () => {
    setConfirmModalVisible(false);
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

  const renderAccountItem = ({ item }: { item: AccountResponse }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => {
        setSelectedAccountId(item.id);
        setAccountModalVisible(false);
        if (amount) validateAmount(amount);
        clearError();
      }}
    >
      <View>
        <Text style={styles.accountItemName}>{item.accountName}</Text>
        <Text style={styles.accountItemBalance}>
          R {item.availableBalance.toLocaleString()} • {item.accountNumber}
        </Text>
      </View>
      {selectedAccountId === item.id && (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const amountNumber = parseFloat(amount) || 0;
  const exceedsBalance = selectedAccount && amountNumber > selectedAccount.availableBalance;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Beneficiary</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>From</Text>
          <TouchableOpacity
            style={styles.accountSelector}
            onPress={() => setAccountModalVisible(true)}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : selectedAccount ? (
              <View>
                <Text style={styles.accountName}>{selectedAccount.accountName}</Text>
                <Text style={styles.accountMeta}>
                  R {selectedAccount.availableBalance.toLocaleString()}
                </Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select account</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>

          <Text style={styles.label}>Amount</Text>
          <View style={[styles.amountWrapper, amountError && styles.inputError]}>
            <Text style={styles.currencySymbol}>R</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#A0A4B8"
              value={amount}
              onChangeText={handleAmountChange}
            />
          </View>
          {amountError ? (
            <Text style={styles.errorText}>{amountError}</Text>
          ) : amount.trim() !== "" ? (
            <Text
              style={[
                styles.balanceHint,
                exceedsBalance && styles.balanceError,
              ]}
            >
              {exceedsBalance
                ? `Amount exceeds available balance of R ${selectedAccount?.availableBalance.toLocaleString()}`
                : `Available: R ${selectedAccount?.availableBalance.toLocaleString()}`}
            </Text>
          ) : null}

          <View style={styles.beneficiaryCard}>
            <Text style={styles.eyebrow}>Verified accountholder</Text>
            <Text style={styles.beneficiaryName}>
              {beneficiaryName || "Selected beneficiary"}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.eyebrow}>Beneficiary Reference</Text>
            <Text style={styles.beneficiaryRef}>
              {reference || "M LEHOKO"}
            </Text>
          </View>

          <Text style={styles.label}>Your reference</Text>
          <TextInput
            style={[styles.input, descError && styles.inputError]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="My statement description"
            placeholderTextColor="#A0A4B8"
            maxLength={50}
          />
          {!!descError && <Text style={styles.errorText}>{descError}</Text>}

          <View style={styles.notificationRow}>
            <Text style={styles.label}>Payment notification</Text>
            <TouchableOpacity style={styles.notificationSelector}>
              <Text style={styles.notificationText}>{notification}</Text>
              <Ionicons name="chevron-down" size={18} color="#888" />
            </TouchableOpacity>
          </View>

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

          {createdTransaction ? (
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
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (saving || !!amountError || !!descError) && styles.disabledButton,
              ]}
              onPress={handlePayPress}
              disabled={saving || !!amountError || !!descError}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Pay</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Account selection modal */}
      <Modal
        animationType="slide"
        transparent
        visible={accountModalVisible}
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeAccounts}
              keyExtractor={(item) => item.id}
              renderItem={renderAccountItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Confirmation modal (first‑time beneficiary) */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning-outline" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.confirmTitle}>First‑time beneficiary</Text>
            <Text style={styles.confirmMessage}>
              You are about to make a payment to{" "}
              <Text style={{ fontWeight: "700" }}>
                {beneficiaryName || "this beneficiary"}
              </Text>
              .{"\n\n"}
              Our system has detected this is a first‑time transaction to this
              recipient.{"\n\n"}
              Please confirm that you trust this beneficiary before proceeding.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonPrimary]}
                onPress={confirmPayment}
              >
                <LinearGradient
                  colors={["#7C6EF7", "#4A6CF7"]}
                  style={styles.gradientConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        onVerified={handleVerifiedSubmit}
        subtitle="Enter your PIN to send this transfer"
      />

      {/* Error Modal */}
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
            <Text style={styles.errorModalTitle}>Transfer failed</Text>
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
    paddingTop: 80,
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  eyebrow: { fontSize: 12, fontWeight: "700", color: colors.textSub, marginBottom: 2 },
  beneficiaryName: { fontSize: 18, fontWeight: "800", color: colors.navy, marginBottom: 4 },
  beneficiaryRef: { fontSize: 16, fontWeight: "600", color: colors.navy },
  divider: { height: 1, backgroundColor: "#E5E5E5", marginVertical: 12 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FC",
    padding: 14,
    borderRadius: 16,
  },
  accountName: { fontSize: 15, fontWeight: "600", color: colors.navy },
  accountMeta: { fontSize: 13, color: colors.textSub, marginTop: 2 },
  placeholderText: { fontSize: 15, color: "#A0A4B8" },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    marginTop: 8,
  },
  currencySymbol: { fontSize: 20, fontWeight: "700", color: colors.navy, marginRight: 8 },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 14,
    color: colors.navy,
  },
  balanceHint: { fontSize: 12, marginTop: 6, color: colors.textSub },
  balanceError: { color: "#DC2626" },
  input: {
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: "#FAFAFA",
    marginTop: 4,
  },
  inputError: { borderColor: "#DC2626" },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 4, marginLeft: 4 },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  notificationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  notificationText: { fontSize: 14, color: colors.navy },
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.navy },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  accountItemName: { fontSize: 16, fontWeight: "600", color: colors.navy },
  accountItemBalance: { fontSize: 13, color: colors.textSub, marginTop: 2 },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  warningIcon: { marginBottom: 16 },
  confirmTitle: { fontSize: 20, fontWeight: "800", color: colors.navy, textAlign: "center", marginBottom: 12 },
  confirmMessage: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtons: { flexDirection: "row", gap: 12, width: "100%" },
  confirmButton: { flex: 1, borderRadius: 50, overflow: "hidden" },
  cancelButton: { backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: colors.greyLine || "#E2E8F0" },
  cancelButtonText: { textAlign: "center", paddingVertical: 14, fontWeight: "600", color: colors.navy },
  confirmButtonPrimary: { overflow: "hidden" },
  gradientConfirm: { paddingVertical: 14, alignItems: "center" },
  confirmButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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
  errorModalTitle: { fontSize: 18, fontWeight: "800", color: colors.navy, textAlign: "center" },
  modalMessage: { marginTop: 8, color: colors.textSub, fontSize: 14, lineHeight: 20, textAlign: "center" },
  modalButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
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
  doneButton: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 50, paddingVertical: 13, alignItems: "center" },
  doneButtonText: { color: "#fff", fontWeight: "800" },
});