
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAccounts } from "@/services/accountService";
import {
  createTransfer,
  requiresAdditionalVerification,
} from "@/services/transactionServices";
import { AccountResponse } from "@/types/account";
import { TransactionResponse } from "@/types/transaction";
import { colors, spacing, radii, sizing } from "@/utils/theme";
import VerifyPinModal from "@/components/VerifyPinModal";
import SuccessModal from "@/components/SuccessModal";

// ─────────────────────────────────────────────
// VALIDATION & FORMATTING
// ─────────────────────────────────────────────

const validateDescription = (desc: string): string => {
  const trimmed = desc.trim();

  if (!trimmed) return "Reference is required";
  if (trimmed.length < 2) return "Minimum 2 characters";
  if (trimmed.length > 50) return "Maximum 50 characters";

  if (!/^[A-Za-z0-9\s\-_]+$/.test(trimmed)) {
    return "Only letters, numbers, spaces, hyphens, underscores";
  }

  return "";
};

const formatCurrency = (value: number) =>
  `R ${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getInitials = (name: string) =>
  name.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────

export default function CreateTransfer() {
  const router = useRouter();

  const {
    beneficiaryId,
    beneficiaryName,
    reference,
  } = useLocalSearchParams<{
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

  const [confirmModalVisible, setConfirmModalVisible] =
    useState(false);

  const [accountModalVisible, setAccountModalVisible] =
    useState(false);

  // Existing UI-only setting.
  const notification = "None";

  const [amountError, setAmountError] = useState("");
  const [descError, setDescError] = useState("");

  // Visual interaction states.
  const [focusedField, setFocusedField] = useState<
    "amount" | "reference" | null
  >(null);

  const [amountTouched, setAmountTouched] = useState(false);
  const [referenceTouched, setReferenceTouched] = useState(false);

  // ───────────────────────────────────────────
  // DATA LOADING
  // ───────────────────────────────────────────

  useEffect(() => {
    loadAccounts();
  }, []);

  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => account.status === "Active"
      ),
    [accounts]
  );

  const selectedAccount = activeAccounts.find(
    (account) => account.id === selectedAccountId
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

      const firstActive = data.find(
        (account) => account.status === "Active"
      );

      if (firstActive) {
        setSelectedAccountId(firstActive.id);
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // AMOUNT VALIDATION
  // ───────────────────────────────────────────

  const validateAmount = (
    value: string,
    account: AccountResponse | undefined = selectedAccount
  ) => {
    const numeric = parseFloat(value);

    if (!value.trim()) {
      setAmountError("Amount is required");
      return false;
    }

    if (isNaN(numeric) || numeric <= 0) {
      setAmountError("Enter a valid amount");
      return false;
    }

    if (
      account &&
      numeric > account.availableBalance
    ) {
      setAmountError(
        `Insufficient Funds. Your available balance is ${formatCurrency(
          account.availableBalance
        )}. This transfer exceeds your available balance.`
      );

      return false;
    }

    setAmountError("");
    return true;
  };

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");

    if ((cleaned.match(/\./g) || []).length > 1) {
      return;
    }

    const numeric = parseFloat(cleaned);

    if (!isNaN(numeric) && numeric < 0) {
      cleaned = "0";
    }

    setAmount(cleaned);
    setAmountTouched(true);
    validateAmount(cleaned);
    clearError();
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setDescError(validateDescription(text));
    clearError();
  };

  // ───────────────────────────────────────────
  // ACCOUNT SELECTION
  // ───────────────────────────────────────────

  const handleAccountSelect = (account: AccountResponse) => {
    setSelectedAccountId(account.id);
    setAccountModalVisible(false);

    if (amount) {
      validateAmount(amount, account);
    }

    clearError();
  };

  // ───────────────────────────────────────────
  // PAYMENT SUBMISSION
  // EXISTING TRANSACTION FLOW PRESERVED
  // ───────────────────────────────────────────

  const validateAll = (): boolean => {
    const amountValid = validateAmount(amount);
    const referenceErr = validateDescription(description);

    setDescError(referenceErr);
    setAmountTouched(true);
    setReferenceTouched(true);

    if (!beneficiaryId) {
      showError("Please choose a beneficiary first.");
      return false;
    }

    if (!selectedAccountId) {
      showError("Please choose an account.");
      return false;
    }

    return amountValid && !referenceErr;
  };

  const handlePayPress = async () => {
    if (!validateAll()) {
      // Field errors are displayed inline.
      return;
    }

    const numericAmount = parseFloat(amount);
    const balance = selectedAccount?.availableBalance || 0;

    Keyboard.dismiss();

    let needsAdditionalVerification = false;
    try {
      needsAdditionalVerification = await requiresAdditionalVerification(
        selectedAccountId,
        numericAmount,
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Please try again.");
      return;
    }

    // The server decides when a duress transaction exceeds the protected cap.
    if (
      needsAdditionalVerification ||
      (!selectedAccount?.isDecoyView && numericAmount > 0.8 * balance)
    ) {
      router.push({
        pathname: "/transactions/selfie-verification",
        params: {
          beneficiaryId: beneficiaryId!,
          beneficiaryName:
            beneficiaryName || "Beneficiary",
          reference:
            description.trim() || reference || "",
          amount: numericAmount.toString(),
          accountId: selectedAccountId,
          accountName:
            selectedAccount?.accountName || "",
        },
      });

      return;
    }

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

      if (
        transaction.status === "Failed" ||
        transaction.status === "Blocked"
      ) {
        showError(
          transaction.statusReason ||
            "This transfer could not be processed. Please try a lower amount."
        );

        return;
      }

      setCreatedTransaction(transaction);
      await loadAccounts();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const amountNumber = parseFloat(amount) || 0;

  const exceedsBalance =
    !!selectedAccount &&
    amountNumber > selectedAccount.availableBalance;

  // ───────────────────────────────────────────
  // ACCOUNT PICKER ROW
  // ───────────────────────────────────────────

  const renderAccountItem = ({
    item,
  }: {
    item: AccountResponse;
  }) => {
    const selected = selectedAccountId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.accountItem,
          selected && styles.selectedAccountItem,
        ]}
        onPress={() => handleAccountSelect(item)}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
      >
        <View style={styles.accountItemIcon}>
          <Ionicons
            name="wallet-outline"
            size={19}
            color={colors.primaryDark}
          />
        </View>

        <View style={styles.accountItemInfo}>
          <Text
            style={styles.accountItemName}
            numberOfLines={1}
          >
            {item.accountName}
          </Text>

          <Text
            style={styles.accountItemNumber}
            numberOfLines={1}
          >
            {item.accountNumber}
          </Text>

          <Text style={styles.accountItemBalance}>
            {formatCurrency(item.availableBalance)}
            <Text style={styles.accountItemBalanceCaption}>
              {" "}available
            </Text>
          </Text>
        </View>

        <Ionicons
          name={
            selected
              ? "checkmark-circle"
              : "ellipse-outline"
          }
          size={23}
          color={
            selected
              ? colors.primary
              : colors.textLight
          }
        />
      </TouchableOpacity>
    );
  };

  // ───────────────────────────────────────────
  // MAIN UI
  // ───────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      {/* PURPLE HEADER */}

      <View style={styles.header}>
        <View style={styles.appBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.appBarTitle}>
            Pay beneficiary
          </Text>

          <View style={styles.appBarSpacer} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            MAKE A PAYMENT
          </Text>

          <Text style={styles.headerHeading}>
            Payment details
          </Text>

          <Text style={styles.headerDescription}>
            Review your recipient and enter the
            amount you'd like to pay.
          </Text>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.headerFooter}>
          <View style={styles.headerFooterIcon}>
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color="#E4E1FF"
            />
          </View>

          <Text style={styles.headerFooterText}>
            Beneficiary payment
          </Text>
        </View>
      </View>

      {/* MAIN CONTENT */}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* PAYMENT RECIPIENT */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Payment recipient
            </Text>

            <Text style={styles.sectionDescription}>
              Check who you're sending money to.
            </Text>
          </View>

          <View style={styles.recipientCard}>
            <View style={styles.recipientTop}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientInitials}>
                  {getInitials(
                    beneficiaryName || "Beneficiary"
                  )}
                </Text>
              </View>

              <View style={styles.recipientInfo}>
                <Text style={styles.recipientEyebrow}>
                  BENEFICIARY
                </Text>

                <Text
                  style={styles.recipientName}
                  numberOfLines={2}
                >
                  {beneficiaryName || "Selected beneficiary"}
                </Text>
              </View>

              <Ionicons
                name="person-outline"
                size={19}
                color={colors.textSub}
              />
            </View>

            <View style={styles.recipientDivider} />

            <View style={styles.recipientDetailRow}>
              <Text style={styles.recipientDetailLabel}>
                Beneficiary reference
              </Text>

              <Text
                style={styles.recipientDetailValue}
                numberOfLines={2}
              >
                {reference || "Not provided"}
              </Text>
            </View>
          </View>

          {/* FROM ACCOUNT */}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              From account
              <Text style={styles.required}> *</Text>
            </Text>

            <TouchableOpacity
              style={styles.accountSelector}
              onPress={() => {
                Keyboard.dismiss();
                setAccountModalVisible(true);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select payment account"
            >
              <View style={styles.selectorIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={19}
                  color={colors.primaryDark}
                />
              </View>

              {loading ? (
                <View style={styles.selectorContent}>
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />
                </View>
              ) : selectedAccount ? (
                <View style={styles.selectorContent}>
                  <Text
                    style={styles.accountName}
                    numberOfLines={1}
                  >
                    {selectedAccount.accountName}
                  </Text>

                  <Text
                    style={styles.accountMeta}
                    numberOfLines={1}
                  >
                    {formatCurrency(
                      selectedAccount.availableBalance
                    )} available
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>
                  Select account
                </Text>
              )}

              <Ionicons
                name="chevron-down"
                size={19}
                color={colors.textSub}
              />
            </TouchableOpacity>
          </View>

          {/* AMOUNT */}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Amount
              <Text style={styles.required}> *</Text>
            </Text>

            <View
              style={[
                styles.amountWrapper,
                focusedField === "amount" &&
                  styles.inputFocused,
                amountTouched &&
                  !!amountError &&
                  styles.inputError,
              ]}
            >
              <Text style={styles.currencySymbol}>
                R
              </Text>

              <View style={styles.currencyDivider} />

              <TextInput
                style={styles.amountInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                value={amount}
                onChangeText={handleAmountChange}
                onFocus={() =>
                  setFocusedField("amount")
                }
                onBlur={() => {
                  setFocusedField(null);
                  setAmountTouched(true);
                  validateAmount(amount);
                }}
                accessibilityLabel="Payment amount in rand"
              />
            </View>

            {amountTouched && !!amountError ? (
              <View style={styles.fieldErrorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.dangerStrong}
                />

                <Text style={styles.fieldError}>
                  {amountError}
                </Text>
              </View>
            ) : selectedAccount ? (
              <View style={styles.balanceHintRow}>
                <Text style={styles.balanceHintLabel}>
                  Available balance
                </Text>

                <Text
                  style={[
                    styles.balanceHintValue,
                    exceedsBalance &&
                      styles.balanceError,
                  ]}
                >
                  {formatCurrency(
                    selectedAccount.availableBalance
                  )}
                </Text>
              </View>
            ) : null}
          </View>

          {/* YOUR REFERENCE */}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Your reference
              <Text style={styles.required}> *</Text>
            </Text>

            <View
              style={[
                styles.inputContainer,
                focusedField === "reference" &&
                  styles.inputFocused,
                referenceTouched &&
                  !!descError &&
                  styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={handleDescriptionChange}
                onFocus={() =>
                  setFocusedField("reference")
                }
                onBlur={() => {
                  setFocusedField(null);
                  setReferenceTouched(true);
                  setDescError(
                    validateDescription(description)
                  );
                }}
                placeholder="Enter your payment reference"
                placeholderTextColor={colors.textLight}
                maxLength={50}
                accessibilityLabel="Your payment reference"
              />
            </View>

            {referenceTouched && !!descError ? (
              <View style={styles.fieldErrorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.dangerStrong}
                />

                <Text style={styles.fieldError}>
                  {descError}
                </Text>
              </View>
            ) : (
              <Text style={styles.fieldHint}>
                This reference will appear in your
                transaction details.
              </Text>
            )}
          </View>

          {/* PAYMENT PREFERENCES */}

          <View style={styles.preferencesSection}>
            <Text style={styles.preferencesTitle}>
              Payment preferences
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>
                Payment notification
              </Text>

              <Text style={styles.preferenceDescription}>
                Notification preference
              </Text>
            </View>

            <View style={styles.notificationValue}>
              <Text style={styles.notificationText}>
                {notification}
              </Text>
            </View>
          </View>

          {/* ERROR BANNER */}

          {!!error && (
            <TouchableOpacity
              style={styles.errorBanner}
              activeOpacity={0.8}
              onPress={() =>
                setShowErrorModal(true)
              }
              accessibilityRole="button"
              accessibilityLabel="View error details"
            >
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={colors.dangerStrong}
              />

              <Text style={styles.errorBannerText}>
                {error}
              </Text>
            </TouchableOpacity>
          )}

          {/* PRIMARY ACTION */}

          {!createdTransaction && (
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (saving ||
                    !!amountError ||
                    !!descError) &&
                    styles.disabledButton,
                ]}
                onPress={handlePayPress}
                disabled={
                  saving ||
                  !!amountError ||
                  !!descError
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Continue to payment"
                accessibilityState={{
                  disabled:
                    saving ||
                    !!amountError ||
                    !!descError,
                  busy: saving,
                }}
              >
                {saving ? (
                  <ActivityIndicator
                    color={colors.white}
                  />
                ) : (
                  <>
                    <Text style={styles.submitText}>
                      Continue to payment
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.white}
                    />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.actionHint}>
                Review the payment details before
                confirming your transfer.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─────────────────────────────
          ACCOUNT SELECTION BOTTOM SHEET
      ───────────────────────────── */}

      <Modal
        animationType="slide"
        transparent
        visible={accountModalVisible}
        statusBarTranslucent
        onRequestClose={() =>
          setAccountModalVisible(false)
        }
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() =>
              setAccountModalVisible(false)
            }
            accessibilityRole="button"
            accessibilityLabel="Close account selection"
          />

          <View style={styles.accountSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleGroup}>
                <Text style={styles.sheetEyebrow}>
                  SOURCE ACCOUNT
                </Text>

                <Text style={styles.sheetTitle}>
                  Choose an account
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setAccountModalVisible(false)
                }
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={colors.navy}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetDescription}>
              Select the account you want to pay from.
            </Text>

            <FlatList
              data={activeAccounts}
              keyExtractor={(item) => item.id}
              renderItem={renderAccountItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.accountListContent
              }
              ListEmptyComponent={
                <View style={styles.sheetEmptyState}>
                  <Text style={styles.sheetEmptyText}>
                    No active accounts available.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────
          PAYMENT CONFIRMATION
      ───────────────────────────── */}

      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        statusBarTranslucent
        onRequestClose={() =>
          setConfirmModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconCircle}>
              <Ionicons
                name="shield-checkmark-outline"
                size={28}
                color={colors.primaryDark}
              />
            </View>

            <Text style={styles.confirmEyebrow}>
              PAYMENT CONFIRMATION
            </Text>

            <Text style={styles.confirmTitle}>
              Review your payment
            </Text>

            <Text style={styles.confirmDescription}>
              Check the details below before
              authorising your payment.
            </Text>

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryAmountLabel}>
                PAYMENT AMOUNT
              </Text>

              <Text
                style={styles.summaryAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatCurrency(amountNumber)}
              </Text>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  To
                </Text>

                <Text
                  style={styles.summaryValue}
                  numberOfLines={2}
                >
                  {beneficiaryName || "Beneficiary"}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  From
                </Text>

                <Text
                  style={styles.summaryValue}
                  numberOfLines={2}
                >
                  {selectedAccount?.accountName || "Account"}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Reference
                </Text>

                <Text
                  style={styles.summaryValue}
                  numberOfLines={2}
                >
                  {description.trim()}
                </Text>
              </View>
            </View>

            <View style={styles.confirmNotice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={colors.primaryDark}
              />

              <Text style={styles.confirmNoticeText}>
                Only continue if you recognise
                and trust this payment recipient.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmPrimaryButton}
              onPress={confirmPayment}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.confirmPrimaryText}>
                Confirm payment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmCancelButton}
              onPress={() =>
                setConfirmModalVisible(false)
              }
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.confirmCancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────
          PENDING TRANSACTION
      ───────────────────────────── */}

      <Modal
        transparent
        animationType="fade"
        statusBarTranslucent
        visible={
          createdTransaction?.status === "Pending"
        }
        onRequestClose={() => undefined}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.verificationModal}>
            <View style={styles.verificationIconCircle}>
              <Ionicons
                name="time-outline"
                size={29}
                color="#A86E00"
              />
            </View>

            <Text style={styles.verificationTitle}>
              Security verification
            </Text>

            <Text style={styles.verificationMessage}>
              For your security, this new beneficiary payment requires an
              additional banking verification. The payment has been placed on
              hold while the verification is completed. No funds have been
              released. You can check its status in your transactions.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() =>
                router.replace("/(tabs)")
              }
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.modalButtonText}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────
          SUCCESS MODAL
      ───────────────────────────── */}

      <SuccessModal
        visible={
          !!createdTransaction &&
          createdTransaction.status !== "Pending"
        }
        title="Payment complete"
        message={`You paid ${formatCurrency(
          Number(amount)
        )} to ${
          beneficiaryName || "your beneficiary"
        }.`}
        primaryLabel="Done"
        onPrimaryPress={() =>
          router.replace("/(tabs)")
        }
      />

      {/* EXISTING PIN VERIFICATION */}

      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() =>
          setVerifyVisible(false)
        }
        onVerified={handleVerifiedSubmit}
        subtitle="Enter your PIN to send this transfer"
      />

      {/* ERROR MODAL */}

      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setShowErrorModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIconCircle}>
              <Ionicons
                name="alert-circle-outline"
                size={29}
                color={colors.dangerStrong}
              />
            </View>

            <Text style={styles.errorModalTitle}>
              Transfer failed
            </Text>

            <Text style={styles.modalMessage}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() =>
                setShowErrorModal(false)
              }
              accessibilityRole="button"
            >
              <Text style={styles.modalButtonText}>
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // PURPLE HEADER

  header: {
    backgroundColor: colors.primaryDark,
  },

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 24) + 8
        : 56,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  backButton: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.sm,
  },

  appBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },

  appBarSpacer: {
    width: sizing.touchTarget,
  },

  headerContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E4E1FF",
    letterSpacing: 0.7,
    marginBottom: spacing.md,
  },

  headerHeading: {
    fontSize: 29,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.6,
    lineHeight: 36,
  },

  headerDescription: {
    fontSize: 13,
    color: "#E4E1FF",
    marginTop: spacing.sm,
    lineHeight: 19,
    maxWidth: 300,
  },

  headerDivider: {
    display: "none",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginHorizontal: spacing.xxl,
  },

  headerFooter: {
    display: "none",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },

  headerFooterIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerFooterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#E4E1FF",
  },

  // MAIN CONTENT

  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  sectionHeader: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -0.3,
  },

  sectionDescription: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: spacing.xs,
    lineHeight: 19,
  },

  // RECIPIENT

  recipientCard: {
    borderWidth: 1,
    borderColor: colors.greyLine,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },

  recipientTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  recipientAvatar: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },

  recipientInitials: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  recipientInfo: {
    flex: 1,
    minWidth: 0,
  },

  recipientEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSub,
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  recipientName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.navy,
  },

  recipientDivider: {
    height: 1,
    backgroundColor: colors.greyLine,
    marginVertical: spacing.lg,
  },

  recipientDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  recipientDetailLabel: {
    fontSize: 12,
    color: colors.textSub,
  },

  recipientDetailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy,
    textAlign: "right",
  },

  // FORM FIELDS

  fieldGroup: {
    marginBottom: spacing.xl,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: spacing.sm,
  },

  required: {
    color: colors.dangerStrong,
  },

  // ACCOUNT SELECTOR

  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 66,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    gap: spacing.md,
  },

  selectorIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },

  selectorContent: {
    flex: 1,
    minWidth: 0,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
  },

  accountMeta: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 4,
  },

  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: colors.textLight,
  },

  // AMOUNT

  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  inputError: {
    borderColor: colors.dangerStrong,
  },

  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.navy,
    marginRight: spacing.md,
  },

  currencyDivider: {
    width: 1,
    height: 26,
    backgroundColor: colors.greyLine,
    marginRight: spacing.md,
  },

  amountInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingVertical: 0,
    fontSize: 24,
    fontWeight: "700",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
  },

  balanceHintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },

  balanceHintLabel: {
    fontSize: 12,
    color: colors.textSub,
  },

  balanceHintValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
  },

  balanceError: {
    color: colors.dangerStrong,
  },

  // REFERENCE

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: "500",
    color: colors.navy,
  },

  fieldHint: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
    gap: 5,
  },

  fieldError: {
    flex: 1,
    fontSize: 12,
    color: colors.dangerStrong,
    lineHeight: 18,
  },

  // PREFERENCES

  preferencesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.greyLine,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
  },

  preferencesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
  },

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 74,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLine,
    gap: spacing.md,
  },

  preferenceInfo: {
    flex: 1,
  },

  preferenceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },

  preferenceDescription: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 4,
  },

  notificationValue: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
  },

  notificationText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSub,
  },

  // PRIMARY ACTION

  actionSection: {
    marginTop: spacing.xxxl,
  },

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    gap: spacing.sm,
  },

  disabledButton: {
    opacity: 0.5,
  },

  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },

  actionHint: {
    fontSize: 12,
    color: colors.textSub,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },

  // ERROR BANNER

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radii.md,
    gap: spacing.sm,
  },

  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.dangerStrong,
    lineHeight: 18,
  },

  // SHARED MODALS

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  // ACCOUNT BOTTOM SHEET

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,23,42,0.55)",
  },

  accountSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    maxHeight: "75%",
  },

  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.greyLine,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  sheetTitleGroup: {
    flex: 1,
  },

  sheetEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  sheetTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.navy,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  sheetDescription: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 19,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  accountListContent: {
    paddingBottom: spacing.xxxl,
  },

  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.greyLine,
    gap: spacing.md,
  },

  selectedAccountItem: {
    backgroundColor: colors.primarySubtle,
  },

  accountItemIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },

  accountItemInfo: {
    flex: 1,
    minWidth: 0,
  },

  accountItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
  },

  accountItemNumber: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 3,
  },

  accountItemBalance: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 5,
    fontVariant: ["tabular-nums"],
  },

  accountItemBalanceCaption: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.textSub,
  },

  sheetEmptyState: {
    padding: spacing.xxl,
    alignItems: "center",
  },

  sheetEmptyText: {
    fontSize: 13,
    color: colors.textSub,
  },

  // CONFIRMATION MODAL

  confirmModalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
  },

  confirmIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  confirmEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },

  confirmTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },

  confirmDescription: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: "center",
    lineHeight: 19,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  paymentSummary: {
    width: "100%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  summaryAmountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSub,
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  summaryAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  summaryDivider: {
    height: 1,
    backgroundColor: colors.greyLine,
    marginVertical: spacing.lg,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.md,
  },

  summaryLabel: {
    fontSize: 12,
    color: colors.textSub,
  },

  summaryValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy,
    textAlign: "right",
  },

  confirmNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  confirmNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSub,
    lineHeight: 18,
  },

  confirmPrimaryButton: {
    width: "100%",
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },

  confirmCancelButton: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },

  confirmCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSub,
  },

  // PENDING MODAL

  verificationModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
  },

  verificationIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  verificationTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },

  verificationMessage: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: "center",
    lineHeight: 20,
    marginTop: spacing.sm,
  },

  // ERROR MODAL

  errorModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
  },

  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  errorModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },

  modalMessage: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: "center",
    lineHeight: 20,
    marginTop: spacing.sm,
  },

  modalButton: {
    width: "100%",
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },

  modalButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
});