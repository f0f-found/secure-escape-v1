// app/beneficiaries/add-beneficiary-form.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Modal,
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

// Validation helpers (pure functions, no state)
const validateName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "Beneficiary name is required";
  if (trimmed.length < 2) return "Minimum 2 characters";
  if (trimmed.length > 25) return "Maximum 25 characters";
  if (!/^[A-Za-z\s\-']+$/.test(trimmed))
    return "Only letters, spaces, hyphens, and apostrophes";
  return "";
};

const validatePhone = (phone: string): string => {
  const trimmed = phone.trim();
  if (!trimmed) return "Cellphone number is required";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 10) return "Must be exactly 10 digits";
  if (!digits.startsWith("0")) return "Must start with 0 (e.g., 0821234567)";
  return "";
};

const validateReference = (ref: string): string => {
  const trimmed = ref.trim();
  if (trimmed.length === 0) return ""; // optional
  if (trimmed.length > 25) return "Maximum 25 characters";
  if (!/^[A-Za-z0-9\s\-_]+$/.test(trimmed))
    return "No special characters allowed";
  return "";
};

export default function AddBeneficiaryForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [notification, setNotification] = useState("None"); // UI only

  // Field errors for real‑time feedback
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [referenceError, setReferenceError] = useState("");

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

  // Simple validation check without side effects
  const isFormValid = () => {
    return (
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      !nameError &&
      !phoneError &&
      !referenceError
    );
  };

  // Validate all fields and update errors, return true if all valid
  const validateAll = (): boolean => {
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const refErr = validateReference(reference);

    setNameError(nameErr);
    setPhoneError(phoneErr);
    setReferenceError(refErr);

    return !nameErr && !phoneErr && !refErr;
  };

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(validateName(text));
    if (error) {
      setError(null);
      setShowErrorModal(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setPhoneError(validatePhone(text));
    if (error) {
      setError(null);
      setShowErrorModal(false);
    }
  };

  const handleReferenceChange = (text: string) => {
    setReference(text);
    setReferenceError(validateReference(text));
    if (error) {
      setError(null);
      setShowErrorModal(false);
    }
  };

  const handleSubmit = () => {
    if (!validateAll()) {
      const err =
        nameError || phoneError || referenceError || "Please correct the highlighted fields.";
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

      const digits = phone.replace(/\D/g, "");
      const created = await addBeneficiary({
        name: name.trim(),
        bankName: "Capitec",
        accountNumber: digits,
        reference: reference.trim() || name.trim(),
      });

      setCreatedBeneficiary(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      showError(message);
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
          {/* Beneficiary Name */}
          <Text style={styles.label}>
            Beneficiary Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Mr M Djonga"
            placeholderTextColor="#A0A4B8"
            maxLength={25}
          />
          {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

          {/* Cellphone number */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            Cellphone number <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            placeholder="082 123 4567"
            placeholderTextColor="#A0A4B8"
            maxLength={10}
          />
          {!!phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

          {/* Beneficiary Reference */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            Beneficiary Reference
          </Text>
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

          {/* One-time beneficiary switch */}
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

          {/* Payment notification (UI only) */}
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
                <Text style={styles.submitText}>Add</Text>
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 12,
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
    marginTop: 12,
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
});