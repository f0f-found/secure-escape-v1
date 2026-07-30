import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { addBeneficiary } from "@/services/beneficiaryService";
import { BeneficiaryResponse } from "@/types/beneficiary";
import { colors } from "@/utils/theme";
import VerifyPinModal from "@/components/VerifyPinModal";

export default function CreateBeneficiary() {
  const router = useRouter();

  const [verifyVisible, setVerifyVisible] = useState(false);

  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [createdBeneficiary, setCreatedBeneficiary] =
    useState<BeneficiaryResponse | null>(null);

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const getValidationMessage = () => {
    const missingFields = [];

    if (!name.trim()) {
      missingFields.push("beneficiary name");
    }

    if (!bankName.trim()) {
      missingFields.push("bank name");
    }

    if (!accountNumber.trim()) {
      missingFields.push("account number");
    }

    if (missingFields.length === 1) {
      return `Please enter the ${missingFields[0]}.`;
    }

    if (missingFields.length > 1) {
      const lastField = missingFields.pop();
      return `Please enter the ${missingFields.join(", ")} and ${lastField}.`;
    }

    if (accountNumber.trim().length > 30) {
      return "Account number cannot be more than 30 characters.";
    }

    return null;
  };

  const handleSubmit = () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      showError(validationMessage);
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
        name: name.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        reference: reference.trim(),
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
        <Text style={styles.headerTitle}>Bank Account</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.whiteCard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Beneficiary name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError(null);
              setShowErrorModal(false);
            }}
            placeholder="e.g. Thabo Nkosi"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Bank name</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={(value) => {
              setBankName(value);
              setError(null);
              setShowErrorModal(false);
            }}
            placeholder="e.g. Capitec"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Account number</Text>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={(value) => {
              setAccountNumber(value);
              setError(null);
              setShowErrorModal(false);
            }}
            placeholder="Enter account number"
            placeholderTextColor="#A0A4B8"
            keyboardType="number-pad"
            maxLength={30}
          />

          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="Optional payment reference"
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

          {createdBeneficiary && (
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
                      pathname: "/transactions/create-transaction",
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
          )}

          {!createdBeneficiary && (
            <TouchableOpacity
              style={[styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Save beneficiary</Text>
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
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 8,
    marginTop: 14,
  },
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
