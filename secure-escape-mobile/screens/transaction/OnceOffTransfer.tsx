import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useRouter } from "expo-router";

import VerifyPinModal from "@/components/VerifyPinModal";
import { getAccounts } from "@/services/accountService";
import { createTransfer } from "@/services/transactionServices";
import { getSessionMode } from "@/services/tokenStore";
import { AccountResponse } from "@/types/account";
import { TransactionResponse } from "@/types/transaction";
import { colors } from "@/utils/theme";

const ACCOUNT_TYPES = ["Cheque", "Savings", "Transmission"];

const validateReference = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) return "Reference is required.";
  if (trimmed.length < 2) return "Reference must be at least 2 characters.";
  if (trimmed.length > 50) return "Reference may not exceed 50 characters.";

  if (!/^[A-Za-z0-9\s\-_,.&/']+$/.test(trimmed)) {
    return "Reference contains unsupported characters.";
  }

  return "";
};

export default function OnceOffTransfer() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [recipientAccountType, setRecipientAccountType] = useState("");
  const [recipientBranchCode, setRecipientBranchCode] = useState("");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [accountTypeModalVisible, setAccountTypeModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(false);

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

  const numericAmount = Number(amount) || 0;

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
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
      showError(
        err instanceof Error ? err.message : "Unable to load your accounts.",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!selectedAccountId) {
      return "Please choose the account you want to pay from.";
    }

    if (!recipientName.trim()) {
      return "Please enter the recipient's name.";
    }

    if (!recipientBank.trim()) {
      return "Please enter the recipient's bank.";
    }

    if (!recipientAccountNumber.trim()) {
      return "Please enter the recipient's account number.";
    }

    if (!/^\d{6,20}$/.test(recipientAccountNumber.trim())) {
      return "Please enter a valid account number.";
    }

    if (!recipientAccountType) {
      return "Please choose the recipient's account type.";
    }

    if (!recipientBranchCode.trim()) {
      return "Please enter the branch code.";
    }

    if (!/^\d{6}$/.test(recipientBranchCode.trim())) {
      return "Branch code must contain 6 digits.";
    }

    if (!amount.trim() || !Number.isFinite(Number(amount)) || numericAmount <= 0) {
      return "Please enter a valid payment amount.";
    }

    if (
      selectedAccount &&
      numericAmount > selectedAccount.availableBalance
    ) {
      return `Amount exceeds the available balance of R ${selectedAccount.availableBalance.toLocaleString()}.`;
    }

    const referenceError = validateReference(description);

    if (referenceError) {
      return referenceError;
    }

    return null;
  };

  const handlePayPress = async () => {
    const validationError = validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      const sessionMode = await getSessionMode();

      if (sessionMode === "Duress") {
        router.push({
          pathname: "/transactions/selfie-verification",
          params: {
            transferType: "onceOff",
            recipientName: recipientName.trim(),
            recipientBank: recipientBank.trim(),
            recipientAccountNumber: recipientAccountNumber.trim(),
            recipientAccountType,
            recipientBranchCode: recipientBranchCode.trim(),
            reference: description.trim(),
            amount: numericAmount.toString(),
            accountId: selectedAccountId,
            accountName: selectedAccount?.accountName ?? "",
          },
        });

        return;
      }

      setConfirmModalVisible(true);
    } catch {
      showError("Unable to verify your session. Please try again.");
    }
  };

  const confirmPayment = () => {
    setConfirmModalVisible(false);
    setVerifyVisible(true);
  };

  const handleVerifiedSubmit = async () => {
    setVerifyVisible(false);

    try {
      setSaving(true);

      const transaction = await createTransfer({
        bankAccountId: selectedAccountId,
        beneficiaryId: null,
        recipientName: recipientName.trim(),
        recipientBank: recipientBank.trim(),
        recipientAccountNumber: recipientAccountNumber.trim(),
        recipientAccountType,
        recipientBranchCode: recipientBranchCode.trim(),
        amount: numericAmount,
        description: description.trim(),
      });

      if (
        transaction.status === "Failed" ||
        transaction.status === "Blocked"
      ) {
        showError(
          transaction.statusReason ||
            "This transfer could not be processed.",
        );
        return;
      }

      setCreatedTransaction(transaction);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Unable to complete the transfer.",
      );
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
      }}
    >
      <View>
        <Text style={styles.accountItemName}>{item.accountName}</Text>
        <Text style={styles.accountItemBalance}>
          R {item.availableBalance.toLocaleString()} • {item.accountNumber}
        </Text>
      </View>

      {selectedAccountId === item.id && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bank Transfer</Text>

        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Recipient details</Text>
          <Text style={styles.sectionHint}>
            Enter the banking details for this once-off payment.
          </Text>

          <Text style={styles.label}>Recipient name</Text>
          <TextInput
            style={styles.input}
            value={recipientName}
            onChangeText={setRecipientName}
            placeholder="Full name"
            placeholderTextColor="#A0A4B8"
            maxLength={150}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Bank</Text>
          <TextInput
            style={styles.input}
            value={recipientBank}
            onChangeText={setRecipientBank}
            placeholder="Bank name"
            placeholderTextColor="#A0A4B8"
            maxLength={100}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Account number</Text>
          <TextInput
            style={styles.input}
            value={recipientAccountNumber}
            onChangeText={(text) =>
              setRecipientAccountNumber(text.replace(/\D/g, ""))
            }
            placeholder="Account number"
            placeholderTextColor="#A0A4B8"
            keyboardType="number-pad"
            maxLength={20}
          />

          <Text style={styles.label}>Account type</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setAccountTypeModalVisible(true)}
          >
            <Text
              style={
                recipientAccountType
                  ? styles.selectorText
                  : styles.placeholderText
              }
            >
              {recipientAccountType || "Select account type"}
            </Text>

            <Ionicons name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>

          <Text style={styles.label}>Branch code</Text>
          <TextInput
            style={styles.input}
            value={recipientBranchCode}
            onChangeText={(text) =>
              setRecipientBranchCode(text.replace(/\D/g, ""))
            }
            placeholder="6-digit branch code"
            placeholderTextColor="#A0A4B8"
            keyboardType="number-pad"
            maxLength={6}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Payment details</Text>

          <Text style={styles.label}>From</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setAccountModalVisible(true)}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : selectedAccount ? (
              <View>
                <Text style={styles.selectorText}>
                  {selectedAccount.accountName}
                </Text>

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
          <View style={styles.amountWrapper}>
            <Text style={styles.currencySymbol}>R</Text>

            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9.]/g, "");

                if ((cleaned.match(/\./g) || []).length > 1) {
                  return;
                }

                setAmount(cleaned);
              }}
              placeholder="0.00"
              placeholderTextColor="#A0A4B8"
              keyboardType="decimal-pad"
            />
          </View>

          {!!selectedAccount && !!amount && (
            <Text style={styles.balanceHint}>
              Available: R{" "}
              {selectedAccount.availableBalance.toLocaleString()}
            </Text>
          )}

          <Text style={styles.label}>Your reference</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Payment reference"
            placeholderTextColor="#A0A4B8"
            maxLength={50}
          />

          {createdTransaction ? (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle"
                size={34}
                color="#166534"
              />

              <Text style={styles.successTitle}>Transfer submitted</Text>

              <Text style={styles.successText}>
                Status: {createdTransaction.status}
              </Text>

              <Text style={styles.successText}>
                Reference: {createdTransaction.bankReference}
              </Text>

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
                saving && styles.disabledButton,
              ]}
              onPress={handlePayPress}
              disabled={saving}
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

              <TouchableOpacity
                onPress={() => setAccountModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeAccounts}
              keyExtractor={(item) => item.id}
              renderItem={renderAccountItem}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={accountTypeModalVisible}
        onRequestClose={() => setAccountTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Account Type</Text>

            {ACCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.typeOption}
                onPress={() => {
                  setRecipientAccountType(type);
                  setAccountTypeModalVisible(false);
                }}
              >
                <Text style={styles.typeOptionText}>{type}</Text>

                {recipientAccountType === type && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setAccountTypeModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Ionicons
              name="shield-checkmark-outline"
              size={48}
              color="#F59E0B"
            />

            <Text style={styles.confirmTitle}>Confirm payment</Text>

            <Text style={styles.confirmMessage}>
              You are about to pay{" "}
              <Text style={styles.boldText}>
                R {numericAmount.toLocaleString()}
              </Text>{" "}
              to{" "}
              <Text style={styles.boldText}>
                {recipientName.trim()}
              </Text>
              .{"\n\n"}
              Please check the banking details before continuing.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmPayment}
              >
                <LinearGradient
                  colors={["#7C6EF7", "#4A6CF7"]}
                  style={styles.gradientConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    Confirm Payment
                  </Text>
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

      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIconCircle}>
              <Ionicons
                name="alert-circle"
                size={30}
                color="#DC2626"
              />
            </View>

            <Text style={styles.errorModalTitle}>Unable to continue</Text>

            <Text style={styles.errorModalMessage}>{error}</Text>

            <TouchableOpacity
              style={styles.modalButton}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    marginTop: 8,
  },

  sectionHint: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: "#FAFAFA",
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#FAFAFA",
  },

  selectorText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },

  placeholderText: {
    fontSize: 15,
    color: "#A0A4B8",
  },

  accountMeta: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },

  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
  },

  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy,
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 14,
    color: colors.navy,
  },

  balanceHint: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 6,
  },

  submitButton: {
    marginTop: 28,
    marginBottom: 40,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
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

  smallModalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    width: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 12,
  },

  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  accountItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
  },

  accountItemBalance: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 2,
  },

  typeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  typeOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },

  closeModalButton: {
    marginTop: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },

  closeModalButtonText: {
    color: colors.navy,
    fontWeight: "700",
  },

  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },

  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 12,
  },

  confirmMessage: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  boldText: {
    fontWeight: "700",
    color: colors.navy,
  },

  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  confirmButton: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
  },

  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: colors.greyLine || "#E2E8F0",
  },

  cancelButtonText: {
    textAlign: "center",
    paddingVertical: 14,
    fontWeight: "600",
    color: colors.navy,
  },

  gradientConfirm: {
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  errorModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },

  errorIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },

  errorModalMessage: {
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
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },

  successTitle: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: "#166534",
  },

  successText: {
    marginTop: 5,
    fontSize: 13,
    color: "#3F6212",
    textAlign: "center",
  },

  doneButton: {
    marginTop: 16,
    width: "100%",
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