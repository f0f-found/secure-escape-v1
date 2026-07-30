// app/beneficiaries/add-bank-account.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { addBeneficiary } from "@/services/beneficiaryService";
import { BeneficiaryResponse } from "@/types/beneficiary";
import VerifyPinModal from "@/components/VerifyPinModal";

// Bank list with realistic branch codes (South Africa)
const banks = [
  { name: "ABSA", branchCode: "632005" },
  { name: "FNB", branchCode: "255005" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "Capitec Bank", branchCode: "470010" },
  { name: "TymeBank", branchCode: "678900" },
  { name: "Discovery Bank", branchCode: "123456" },
  { name: "Bank Zero", branchCode: "789012" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Investec", branchCode: "580105" },
  { name: "Sasfin", branchCode: "612100" },
  { name: "Bidvest Bank", branchCode: "462005" },
  { name: "Grindrod Bank", branchCode: "660000" },
];

// Validation helpers – updated limits
const validateName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "Beneficiary name is required";
  if (trimmed.length < 2) return "Minimum 2 characters";
  if (trimmed.length > 25) return "Maximum 25 characters";
  if (!/^[A-Za-z\s\-']+$/.test(trimmed))
    return "Only letters, spaces, hyphens, and apostrophes";
  return "";
};

const validateAccountNumber = (num: string): string => {
  const trimmed = num.trim();
  if (!trimmed) return "Account number is required";
  if (!/^\d+$/.test(trimmed)) return "Digits only";
  if (trimmed.length !== 16) return "Must be exactly 16 digits"; // Updated to 16
  return "";
};

const validateBranchCode = (code: string): string => {
  const trimmed = code.trim();
  if (trimmed.length === 0) return ""; // optional
  if (!/^\d+$/.test(trimmed)) return "Digits only";
  if (trimmed.length > 6) return "Maximum 6 digits";
  return "";
};

const validateReference = (ref: string): string => {
  const trimmed = ref.trim();
  if (trimmed.length === 0) return ""; // optional
  if (trimmed.length > 25) return "Maximum 25 characters"; // Updated to 25
  if (!/^[A-Za-z0-9\s\-_]+$/.test(trimmed))
    return "No special characters allowed";
  return "";
};

export default function AddBankAccount() {
  const router = useRouter();

  // Form fields
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [reference, setReference] = useState("");
  const [notification, setNotification] = useState("None"); // UI only

  // Errors
  const [nameError, setNameError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [bankError, setBankError] = useState("");
  const [branchError, setBranchError] = useState("");
  const [referenceError, setReferenceError] = useState("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Submission state
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [createdBeneficiary, setCreatedBeneficiary] =
    useState<BeneficiaryResponse | null>(null);

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  // Real‑time validation (side‑effect free)
  const isFormValid = (): boolean => {
    return (
      beneficiaryName.trim().length > 0 &&
      accountNumber.trim().length > 0 &&
      selectedBank.length > 0 &&
      !nameError &&
      !accountError &&
      !bankError &&
      !branchError &&
      !referenceError
    );
  };

  // Validate all fields and update errors
  const validateAll = (): boolean => {
    const nameErr = validateName(beneficiaryName);
    const accErr = validateAccountNumber(accountNumber);
    const bankErr = selectedBank ? "" : "Please select a bank";
    const branchErr = validateBranchCode(branchCode);
    const refErr = validateReference(reference);

    setNameError(nameErr);
    setAccountError(accErr);
    setBankError(bankErr);
    setBranchError(branchErr);
    setReferenceError(refErr);

    return !nameErr && !accErr && !bankErr && !branchErr && !refErr;
  };

  // Handlers with live validation
  const handleNameChange = (text: string) => {
    setBeneficiaryName(text);
    setNameError(validateName(text));
    if (error) { setError(null); setShowErrorModal(false); }
  };

  const handleAccountChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16); // enforce max 16
    setAccountNumber(digits);
    setAccountError(validateAccountNumber(digits));
    if (error) { setError(null); setShowErrorModal(false); }
  };

  const handleBranchChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 6);
    setBranchCode(digits);
    setBranchError(validateBranchCode(digits));
    if (error) { setError(null); setShowErrorModal(false); }
  };

  const handleReferenceChange = (text: string) => {
    setReference(text);
    setReferenceError(validateReference(text));
    if (error) { setError(null); setShowErrorModal(false); }
  };

  const handleBankSelect = (bank: { name: string; branchCode: string }) => {
    setSelectedBank(bank.name);
    setBranchCode(bank.branchCode); // auto‑populate branch code
    setBankError("");
    setModalVisible(false);
    if (error) { setError(null); setShowErrorModal(false); }
  };

  const handleSubmit = () => {
    if (!validateAll()) {
      const err =
        nameError || accountError || bankError || branchError || referenceError ||
        "Please correct the highlighted fields.";
      showError(err);
      return;
    }
    setVerifyVisible(true);
  };

  const handleVerifiedSubmit = async () => {
    setVerifyVisible(false);
    try {
      setSaving(true);
      setError(null);

      const created = await addBeneficiary({
        name: beneficiaryName.trim(),
        bankName: selectedBank,
        accountNumber: accountNumber.trim(),
        reference: reference.trim() || beneficiaryName.trim(),
      });

      setCreatedBeneficiary(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderBankItem = ({ item }: { item: { name: string; branchCode: string } }) => (
    <TouchableOpacity
      style={styles.bankItem}
      onPress={() => handleBankSelect(item)}
    >
      <Text style={styles.bankItemText}>{item.name}</Text>
      {selectedBank === item.name && (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Beneficiary</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.whiteCard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.infoText}>
            Ensure you enter the correct details. Only Capitec account numbers
            are verified against the actual account holder.
          </Text>

          {/* Beneficiary name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Beneficiary name <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              value={beneficiaryName}
              onChangeText={handleNameChange}
              placeholder="e.g., John Doe"
              placeholderTextColor="#A0A4B8"
              maxLength={25}
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Account number */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Account number <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, accountError && styles.inputError]}
              value={accountNumber}
              onChangeText={handleAccountChange}
              keyboardType="number-pad"
              placeholder="1234567890123456"
              placeholderTextColor="#A0A4B8"
              maxLength={16}
            />
            {!!accountError && (
              <Text style={styles.errorText}>{accountError}</Text>
            )}
          </View>

          {/* Bank selection */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Choose bank <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectInput, bankError && styles.inputError]}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={
                  selectedBank ? styles.selectText : styles.placeholderText
                }
              >
                {selectedBank || "Select bank"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#aaa" />
            </TouchableOpacity>
            {!!bankError && <Text style={styles.errorText}>{bankError}</Text>}
          </View>

          {/* Branch code */}
          <View style={styles.field}>
            <Text style={styles.label}>Branch code</Text>
            <TextInput
              style={[styles.input, branchError && styles.inputError]}
              value={branchCode}
              onChangeText={handleBranchChange}
              keyboardType="number-pad"
              placeholder="e.g., 123456"
              placeholderTextColor="#A0A4B8"
              maxLength={6}
            />
            {!!branchError && (
              <Text style={styles.errorText}>{branchError}</Text>
            )}
          </View>

          {/* One‑time switch */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>One-time beneficiary</Text>
              <Text style={styles.switchSub}>Used for once-off payment</Text>
            </View>
            <Switch
              value={oneTime}
              onValueChange={setOneTime}
              trackColor={{ false: "#ccc", true: colors.primary }}
            />
          </View>

          {/* Reference */}
          <View style={styles.field}>
            <Text style={styles.label}>Beneficiary reference</Text>
            <TextInput
              style={[styles.input, referenceError && styles.inputError]}
              value={reference}
              onChangeText={handleReferenceChange}
              placeholder="M LEHOKO"
              placeholderTextColor="#A0A4B8"
              maxLength={25}
            />
            {!!referenceError && (
              <Text style={styles.errorText}>{referenceError}</Text>
            )}
          </View>

          {/* Notification (UI only) */}
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

          {createdBeneficiary ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Beneficiary saved</Text>
              <Text style={styles.successText}>
                {createdBeneficiary.name} is ready for payments.
              </Text>
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() =>
                    router.replace("/beneficiaries/beneficiary-list")
                  }
                >
                  <Text style={styles.secondaryButtonText}>View list</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() =>
                    router.push({
                      pathname: "/transactions/create-transfer",
                      params: {
                        beneficiaryId: createdBeneficiary.id,
                        beneficiaryName: createdBeneficiary.name,
                        reference: createdBeneficiary.reference,
                      },
                    })
                  }
                >
                  <Text style={styles.payButtonText}>Pay now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || saving) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Add Beneficiary</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        onVerified={handleVerifiedSubmit}
        subtitle="Enter your PIN to add this beneficiary"
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
            <Text style={styles.modalTitle}>Could not continue</Text>
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

      {/* Bank selection modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={banks}
              keyExtractor={(item) => item.name}
              renderItem={renderBankItem}
              showsVerticalScrollIndicator={false}
            />
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
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
  },
  scrollContent: { paddingBottom: 20 },
  infoText: {
    fontSize: 13,
    color: colors.textSub,
    backgroundColor: "#F8F9FC",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    lineHeight: 18,
  },
  field: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    marginBottom: 4,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginLeft: 4,
    marginTop: 2,
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.greyLine || "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 4,
  },
  selectText: { fontSize: 15, color: colors.navy },
  placeholderText: { fontSize: 15, color: "#aaa" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F8F9FC",
    padding: 14,
    borderRadius: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 2,
  },
  switchSub: { fontSize: 12, color: colors.textSub },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notificationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  notificationText: { fontSize: 14, color: colors.navy },
  submitButton: {
    marginTop: 16,
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
  errorModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
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
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.navy },
  modalMessage: { fontSize: 14, color: colors.textSub, textAlign: "center", marginTop: 8 },
  bankItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  bankItemText: { fontSize: 16, color: colors.navy },
  successBox: {
    marginTop: 22,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
  },
  successText: {
    marginTop: 4,
    fontSize: 13,
    color: "#3F6212",
  },
  successActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  payButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});