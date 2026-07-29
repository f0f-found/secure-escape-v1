// app/secure-escape/emergency-contact.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

// Validation helpers
const validateName = (name: string): boolean => {
  // At least 2 characters, max 20, letters, spaces, hyphens, apostrophes
  const trimmed = name.trim();
  return (
    trimmed.length >= 2 &&
    trimmed.length <= 20 &&
    /^[A-Za-z\s\-']+$/.test(trimmed)
  );
};

const validatePhone = (phone: string): boolean => {
  const trimmed = phone.trim();
  if (trimmed === "") return false;

  // Check prefix
  const startsWith0 = trimmed.startsWith("0");
  const startsWith27 = trimmed.startsWith("+27");

  if (!startsWith0 && !startsWith27) return false;

  // Strip all non-digits
  const digits = trimmed.replace(/\D/g, "");

  // If starts with 0, must be exactly 10 digits (0 + 9 digits)
  if (startsWith0) return digits.length === 10;
  // If starts with +27, digits must be exactly 11 (27 + 9 digits)
  if (startsWith27) return digits.length === 11;

  return false;
};

export default function EmergencyContact() {
  const router = useRouter();
  const [contacts, setContacts] = useState([
    { id: Date.now().toString(), name: "", surname: "", phone: "" },
  ]);
  const [errors, setErrors] = useState<{
    [id: string]: { name?: string; surname?: string; phone?: string };
  }>({});
  const [validContactAdded, setValidContactAdded] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Modal for "Why add a safety contact?"
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const infoScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Check if a single contact is completely valid (fields non-empty and pass validation)
  const isContactValid = (contact: {
    name: string;
    surname: string;
    phone: string;
  }) => {
    return (
      contact.name.trim() !== "" &&
      contact.surname.trim() !== "" &&
      contact.phone.trim() !== "" &&
      validateName(contact.name) &&
      validateName(contact.surname) &&
      validatePhone(contact.phone)
    );
  };

  // Recompute overall validity
  const checkValidContacts = (contactsList: typeof contacts) => {
    const hasValid = contactsList.some((contact) => isContactValid(contact));
    setValidContactAdded(hasValid);
    return hasValid;
  };

  // Update a contact field and validate
  const updateContact = (
    id: string,
    field: "name" | "surname" | "phone",
    value: string
  ) => {
    const newContacts = contacts.map((contact) =>
      contact.id === id ? { ...contact, [field]: value } : contact
    );
    setContacts(newContacts);

    // Validate this field
    let error = "";
    if (field === "name" || field === "surname") {
      const trimmed = value.trim();
      if (trimmed === "") {
        error = "This field is required";
      } else if (trimmed.length < 2) {
        error = "Minimum 2 characters";
      } else if (trimmed.length > 20) {
        error = "Maximum 20 characters";
      } else if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
        error = "Only letters, spaces, hyphens, and apostrophes allowed";
      }
    } else if (field === "phone") {
      const trimmed = value.trim();
      if (trimmed === "") {
        error = "Phone number is required";
      } else {
        // Check prefix
        const startsWith0 = trimmed.startsWith("0");
        const startsWith27 = trimmed.startsWith("+27");
        if (!startsWith0 && !startsWith27) {
          error = "Must start with 0 or +27";
        } else {
          const digits = trimmed.replace(/\D/g, "");
          if (startsWith0 && digits.length !== 10) {
            error = "Must have 10 digits (e.g., 0821234567)";
          } else if (startsWith27 && digits.length !== 11) {
            error = "Must have 9 digits after +27 (e.g., +27 82 123 4567)";
          }
        }
      }
    }

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: error || undefined,
      },
    }));

    checkValidContacts(newContacts);
  };

  const addContact = () => {
    if (contacts.length >= 5) {
      Alert.alert("Limit reached", "You can add up to 5 emergency contacts.");
      return;
    }
    const newContact = {
      id: Date.now().toString(),
      name: "",
      surname: "",
      phone: "",
    };
    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
    setErrors((prev) => ({
      ...prev,
      [newContact.id]: {},
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkValidContacts(newContacts);
  };

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      Alert.alert(
        "Cannot remove",
        "You need at least one emergency contact slot."
      );
      return;
    }
    const newContacts = contacts.filter((c) => c.id !== id);
    setContacts(newContacts);
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkValidContacts(newContacts);
  };

  const handleContinue = () => {
    if (!validContactAdded) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Missing information",
        "Please fill in at least one complete emergency contact with valid details (name, surname, phone number)."
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/secure-escape/congrats" as any);
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

  // Modal handlers
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

  const getButtonText = () => {
    return validContactAdded ? "Add Contact" : "Continue";
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
          trust – without alerting the attacker.
        </Text>
        <TouchableOpacity onPress={openInfoModal}>
          <Text style={styles.link}>Why add a safety contact?</Text>
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
            – they will be notified in an emergency.
          </Text>
        </View>

        {contacts.map((contact, index) => {
          const contactErrors = errors[contact.id] || {};
          return (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactTitle}>Contact {index + 1}</Text>
                {contacts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeContact(contact.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF9500" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    contactErrors.name && styles.inputError,
                  ]}
                  value={contact.name}
                  onChangeText={(text) =>
                    updateContact(contact.id, "name", text)
                  }
                  placeholder="First name"
                  placeholderTextColor="#aaa"
                  maxLength={20}
                />
                {contactErrors.name && (
                  <Text style={styles.errorText}>{contactErrors.name}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Surname <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    contactErrors.surname && styles.inputError,
                  ]}
                  value={contact.surname}
                  onChangeText={(text) =>
                    updateContact(contact.id, "surname", text)
                  }
                  placeholder="Last name"
                  placeholderTextColor="#aaa"
                  maxLength={20}
                />
                {contactErrors.surname && (
                  <Text style={styles.errorText}>{contactErrors.surname}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    contactErrors.phone && styles.inputError,
                  ]}
                  value={contact.phone}
                  onChangeText={(text) =>
                    updateContact(contact.id, "phone", text)
                  }
                  keyboardType="phone-pad"
                  placeholder="082 123 4567"
                  placeholderTextColor="#aaa"
                  maxLength={15}
                />
                {contactErrors.phone && (
                  <Text style={styles.errorText}>{contactErrors.phone}</Text>
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
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
            }
          }}
          disabled={!validContactAdded}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient
              colors={
                validContactAdded ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]
              }
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

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
                      <Text style={styles.boldText}>NO indication</Text> on your
                      phone. The SMS is sent silently in the background.
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
                      contact at any time through your bank.
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
    paddingTop: 100,
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
    color: colors.textSub || "#718096",
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
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.greyLine || "#E2E8F0",
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
    color: colors.navy || "#1A202C",
  },
  deleteButton: {
    padding: 4,
  },
  field: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy || "#1A202C",
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
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
  // Modal styles
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
    color: colors.navy || "#1A202C",
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