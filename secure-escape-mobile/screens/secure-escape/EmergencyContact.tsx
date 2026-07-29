// screens/Screen7_EmergencyContact.js - Fixed (no undefined 'shadow')
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addEmergencyContact } from "@/services/emergencyContactService";
import { ErrorBanner, ErrorModal } from "@/components/FormErrorMessage";
import * as Contacts from "expo-contacts";

type LocalContact = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
};

export default function EmergencyContact() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [contacts, setContacts] = useState<LocalContact[]>([
    {
      id: Date.now().toString(),
      name: "",
      surname: "",
      phone: "",
      relationship: "",
      isPrimary: false,
    },
  ]);
  const [validContactAdded, setValidContactAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const checkValidContacts = (contactsList: LocalContact[]) => {
    const hasValid = contactsList.some(
      (contact) =>
        contact.name.trim() !== "" &&
        contact.surname.trim() !== "" &&
        contact.phone.trim() !== "",
    );
    setValidContactAdded(hasValid);
    return hasValid;
  };

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      showError("You need at least one emergency contact.");
      return;
    }
    const newContacts = contacts.filter((c) => c.id !== id);
    setContacts(newContacts);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkValidContacts(newContacts);
  };

  const updateContact = (
    id: string,
    field: keyof LocalContact,
    value: string | boolean,
  ) => {
    const newContacts = contacts.map((contact) =>
      contact.id === id ? { ...contact, [field]: value } : contact,
    );
    setContacts(newContacts);
    clearError();
    checkValidContacts(newContacts);
  };

  const getValidationMessage = () => {
    const completeContacts = contacts.filter(
      (c) => c.name.trim() && c.surname.trim() && c.phone.trim(),
    );

    if (completeContacts.length === 0) {
      const firstContact = contacts[0];
      const missingFields = [];

      if (!firstContact.name.trim()) {
        missingFields.push("name");
      }

      if (!firstContact.surname.trim()) {
        missingFields.push("surname");
      }

      if (!firstContact.phone.trim()) {
        missingFields.push("phone number");
      }

      if (missingFields.length === 1) {
        return `Please enter the emergency contact ${missingFields[0]}.`;
      }

      const lastField = missingFields.pop();
      return `Please enter the emergency contact ${missingFields.join(", ")} and ${lastField}.`;
    }

    for (const contact of completeContacts) {
      const fullName = `${contact.name.trim()} ${contact.surname.trim()}`;

      if (fullName.length > 100) {
        return "Emergency contact full name cannot be more than 100 characters.";
      }

      if (contact.phone.trim().length > 30) {
        return "Emergency contact phone number cannot be more than 30 characters.";
      }

      if (contact.relationship.trim().length > 50) {
        return "Emergency contact relationship cannot be more than 50 characters.";
      }
    }

    return null;
  };

  const handleContinue = async () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(validationMessage);
      return;
    }

    try {
      const validContacts = contacts.filter(
        (c) => c.name.trim() && c.surname.trim() && c.phone.trim(),
      );

      for (const contact of validContacts) {
        await addEmergencyContact({
          fullName: `${contact.name.trim()} ${contact.surname.trim()}`,
          phoneNumber: contact.phone.trim(),
          relationship: contact.relationship.trim(),
          isPrimary: contact.isPrimary,
          notifyOnDuress: true,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (from === "onboarding") {
        router.push("/secure-escape/congrats");
      } else {
        router.push("/secure-escape/manage-secure-escape");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(
        error instanceof Error ? error.message : "Failed to save contacts.",
      );
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addContact = () => {
    if (contacts.length >= 5) {
      showError("You can add up to 5 emergency contacts.");
      return;
    }
    const newContact: LocalContact = {
      id: Date.now().toString(),
      name: "",
      surname: "",
      phone: "",
      relationship: "",
      isPrimary: false,
    };
    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkValidContacts(newContacts);
  };

  const importFromContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        showError("Contacts permission is needed to import a contact.");
        return;
      }

      const picked = await Contacts.presentContactPickerAsync();

      if (!picked) return; // user cancelled the picker

      const phoneNumber = picked.phoneNumbers?.[0]?.number?.trim() ?? "";
      const firstName = picked.firstName?.trim() ?? "";
      const lastName = picked.lastName?.trim() ?? "";

      const firstEmptyIndex = contacts.findIndex(
        (c) => !c.name.trim() && !c.surname.trim() && !c.phone.trim(),
      );

      let newContacts: LocalContact[];

      if (firstEmptyIndex !== -1) {
        newContacts = contacts.map((c, i) =>
          i === firstEmptyIndex
            ? { ...c, name: firstName, surname: lastName, phone: phoneNumber }
            : c,
        );
      } else {
        if (contacts.length >= 5) {
          showError("You can add up to 5 emergency contacts.");
          return;
        }

        newContacts = [
          ...contacts,
          {
            id: Date.now().toString(),
            name: firstName,
            surname: lastName,
            phone: phoneNumber,
            relationship: "",
            isPrimary: false,
          },
        ];
      }

      setContacts(newContacts);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      checkValidContacts(newContacts);
      clearError();
    } catch (err) {
      showError("Failed to import contact. Please try adding it manually.");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.gradientHeader}
      >
        <Text style={styles.backArrow} onPress={() => router.back()}>
          ‹
        </Text>
        <Text style={styles.headerTitle}>Emergency Contact</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            This contact will be notified when duress PIN is used. We will also
            contact authorities and our fraud team.
          </Text>
        </View>

        {contacts.map((contact, index) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact {index + 1}</Text>
              {contacts.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeContact(contact.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={contact.name}
                onChangeText={(text) => updateContact(contact.id, "name", text)}
                maxLength={50}
                placeholder="First name"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Surname</Text>
              <TextInput
                style={styles.input}
                value={contact.surname}
                onChangeText={(text) =>
                  updateContact(contact.id, "surname", text)
                }
                maxLength={50}
                placeholder="Last name"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={contact.phone}
                onChangeText={(text) =>
                  updateContact(contact.id, "phone", text)
                }
                maxLength={30}
                keyboardType="phone-pad"
                placeholder="+27 XX XXX XXXX"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={contact.relationship}
                onChangeText={(text) =>
                  updateContact(contact.id, "relationship", text)
                }
                maxLength={50}
                placeholder="e.g. Mother, Friend"
                placeholderTextColor="#aaa"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryRow}
              onPress={() =>
                updateContact(contact.id, "isPrimary", !contact.isPrimary)
              }
            >
              <View
                style={[styles.checkbox, contact.isPrimary && styles.checked]}
              />
              <Text style={styles.checkLabel}>Set as primary contact</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.importButton}
          onPress={importFromContacts}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.importButtonText}>Import from Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.addButtonText}>Add Another Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (validContactAdded) {
              animateButton();
              handleContinue();
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const validationMessage = getValidationMessage();
              if (validationMessage) {
                showError(validationMessage);
              }
            }
          }}
          disabled={false}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient
              colors={
                validContactAdded ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]
              }
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        <ErrorBanner message={error} onPress={() => setShowErrorModal(true)} />
      </View>
      <ErrorModal
        title="Emergency contact"
        message={error}
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  gradientHeader: {
    paddingTop: 80, // increased from 48 to push header down
    paddingHorizontal: 20,
    paddingBottom: 30, // increased from 20 to add more space below header
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backArrow: { fontSize: 18, color: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.greyLine,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkLabel: {
    fontSize: 13,
    color: colors.textSub,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSub,
    flex: 1,
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.greyLine,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
  },
  deleteButton: {
    padding: 4,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 40,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 50,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#F0EFFF",
    borderRadius: 40,
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
