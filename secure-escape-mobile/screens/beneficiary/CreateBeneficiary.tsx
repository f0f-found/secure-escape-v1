import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { addBeneficiary } from "@/services/beneficiaryService";
import { BeneficiaryResponse } from "@/types/beneficiary";
import { colors } from "@/utils/theme";

export default function CreateBeneficiary() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdBeneficiary, setCreatedBeneficiary] =
    useState<BeneficiaryResponse | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !bankName.trim() || !accountNumber.trim()) {
      Alert.alert("Missing details", "Please complete the required fields.");
      return;
    }

    try {
      setSaving(true);

      const created = await addBeneficiary({
        name: name.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        reference: reference.trim(),
      });

      setCreatedBeneficiary(created);
    } catch (err) {
      Alert.alert(
        "Could not add beneficiary",
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
            onChangeText={setName}
            placeholder="e.g. Thabo Nkosi"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Bank name</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="e.g. Capitec"
            placeholderTextColor="#A0A4B8"
          />

          <Text style={styles.label}>Account number</Text>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Enter account number"
            placeholderTextColor="#A0A4B8"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="Optional payment reference"
            placeholderTextColor="#A0A4B8"
          />

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
