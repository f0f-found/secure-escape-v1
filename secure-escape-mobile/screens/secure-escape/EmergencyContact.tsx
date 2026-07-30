import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
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
  const skipScale = useRef(new Animated.Value(1)).current;

  // "Why add a safety contact?" modal
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const infoScaleAnim = useRef(new Animated.Value(0.9)).current;

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const openInfoModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInfoModalVisible(true);
    Animated.parallel([
      Animated.timing(infoFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(infoScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeInfoModal = () => {
    Animated.parallel([
      Animated.timing(infoFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(infoScaleAnim, {
        toValue: 0.9,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => setInfoModalVisible(false));
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
      showError("You need at least one emergency contact slot.");
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
      return "Please fill in at least one complete emergency contact (name, surname, phone number).";
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

  const goToNextScreen = () => {
    if (from === "onboarding") {
      router.push("/secure-escape/congrats");
    } else {
      router.push("/secure-escape/manage-secure-escape");
    }
  };

  const handleAddContact = async () => {
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
      goToNextScreen();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(
        err instanceof Error ? err.message : "Failed to save contacts.",
      );
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToNextScreen();
  };

  const animateButton = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contact</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Add a Safety Contact (Optional)</Text>
        <Text style={styles.sub}>
          If you ever use your duress PIN, we can silently notify someone you
          trust — without alerting the attacker.
        </Text>
        <TouchableOpacity onPress={openInfoModal}>
          <Text style={styles.link}>Why add a safety contact? </Text>
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.primary}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            <Text style={styles.boldText}>
              Only add someone you trust completely
            </Text>{" "}
            — they will be notified in an emergency.
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

        <ErrorBanner message={error} onPress={() => setShowErrorModal(true)} />

        {/* Premium button row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[
              styles.actionButtonWrapper,
              !validContactAdded && styles.disabledWrapper,
            ]}
            onPress={() => {
              if (validContactAdded) {
                animateButton(buttonScale);
                handleAddContact();
              } else {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );
              }
            }}
            disabled={!validContactAdded}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{ transform: [{ scale: buttonScale }], width: "100%" }}
            >
              <LinearGradient
                colors={
                  validContactAdded ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]
                }
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Add Contact</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              animateButton(skipScale);
              handleSkip();
            }}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [{ scale: skipScale }],
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <ErrorModal
        title="Emergency contact"
        message={error}
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Modal: "Why add a safety contact?" */}
      <Modal
        transparent
        visible={infoModalVisible}
        animationType="none"
        onRequestClose={closeInfoModal}
      >
        <TouchableWithoutFeedback onPress={closeInfoModal}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: infoFadeAnim }]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalCard,
                  { transform: [{ scale: infoScaleAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeInfoModal}
                >
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Why add a safety contact?</Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      Your safety contact will receive a silent SMS if your
                      duress PIN is ever used. It will include your last known
                      location so they can alert authorities if needed.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      Attackers will see{" "}
                      <Text style={styles.boldText}>
                        NO indication on your phone
                      </Text>
                      . The SMS is sent silently in the background.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      You are in control. You can add, change, or remove this
                      contact at any time through the app.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  gradientHeader: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 4,
    lineHeight: 20,
  },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: "underline",
    marginVertical: 8,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  noteIcon: { marginRight: 10, marginTop: 1 },
  noteText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    flex: 1,
  },
  boldText: { fontWeight: "700" },
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
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
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  actionButtonWrapper: {
    flex: 2,
    borderRadius: 50,
    overflow: "hidden",
  },
  disabledWrapper: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bulletList: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  bulletText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
});
