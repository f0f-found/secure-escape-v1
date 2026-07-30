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
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { setDuressPin } from "@/services/secureEscapeService";
import { ErrorBanner, ErrorModal } from "@/components/FormErrorMessage";

export default function DuressPin() {
  const router = useRouter();
  const [normalPin, setNormalPin] = useState("");
  const [duressPin, setDuressPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // "What is a Duress PIN?" modal
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const infoScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Terms & Conditions modal
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const termsFadeAnim = useRef(new Animated.Value(0)).current;
  const termsScaleAnim = useRef(new Animated.Value(0.9)).current;
  const [modalAgreed, setModalAgreed] = useState(false);

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

  const openTermsModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalAgreed(false);
    setTermsModalVisible(true);
    Animated.parallel([
      Animated.timing(termsFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(termsScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeTermsModal = () => {
    Animated.parallel([
      Animated.timing(termsFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(termsScaleAnim, {
        toValue: 0.9,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => setTermsModalVisible(false));
  };

  const getValidationMessage = () => {
    if (!normalPin.trim()) {
      return "Please enter your normal PIN to confirm it's you.";
    }

    if (normalPin.length < 4 || normalPin.length > 6) {
      return "Normal PIN must be 4 to 6 digits.";
    }

    if (!duressPin.trim()) {
      return "Please create your duress PIN.";
    }

    if (duressPin.length < 4 || duressPin.length > 6) {
      return "Duress PIN must be 4 to 6 digits.";
    }

    if (duressPin === normalPin) {
      return "Your duress PIN must be different from your normal PIN.";
    }

    if (!confirmPin.trim()) {
      return "Please re-enter your duress PIN.";
    }

    if (confirmPin !== duressPin) {
      return "Duress PINs do not match.";
    }

    return null;
  };

  const isFormValid =
    normalPin.length >= 4 &&
    duressPin.length >= 4 &&
    duressPin !== normalPin &&
    confirmPin === duressPin;

  // Activate button: validate, then open T&C modal
  const handleEnable = () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(validationMessage);
      return;
    }

    openTermsModal();
  };

  // Confirm & Agree inside the modal: actually saves and navigates
  const handleConfirm = async () => {
    if (!modalAgreed) return;

    try {
      setIsSaving(true);
      clearError();

      // NOTE: passing normalPin as the verification field here — adjust
      // the property name once the backend contract changes from
      // currentPassword to a PIN-based field.
      await setDuressPin({
        currentPin: normalPin,
        duressPin,
      } as Parameters<typeof setDuressPin>[0]);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeTermsModal();
      router.push("/secure-escape/emergency-contact?from=onboarding");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      closeTermsModal();
      showError(
        err instanceof Error ? err.message : "Failed to set duress PIN.",
      );
    } finally {
      setIsSaving(false);
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
        <Text style={styles.headerTitle}>Set Duress PIN</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Your Silent Safety Signal</Text>
        <Text style={styles.sub}>
          This is the PIN you should ONLY use if you&apos;re being forced to
          transact under threat.
        </Text>
        <TouchableOpacity onPress={openInfoModal}>
          <Text style={styles.link}>What is a Duress PIN? </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Enter your Normal PIN</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={normalPin}
          onChangeText={(value) => {
            setNormalPin(value);
            clearError();
          }}
          placeholder="••••"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Create your Duress PIN</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={duressPin}
          onChangeText={(value) => {
            setDuressPinValue(value);
            clearError();
          }}
          placeholder="••••"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Confirm your Duress PIN</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={confirmPin}
          onChangeText={(value) => {
            setConfirmPin(value);
            clearError();
          }}
          placeholder="••••"
          placeholderTextColor="#ccc"
        />

        <ErrorBanner message={error} onPress={() => setShowErrorModal(true)} />

        <TouchableOpacity
          style={[styles.enableButton, !isFormValid && styles.disabledButton]}
          onPress={handleEnable}
          disabled={!isFormValid}
        >
          <LinearGradient
            colors={isFormValid ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Activate Silent Protection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ErrorModal
        title="Duress PIN"
        message={error}
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Modal: "What is a Duress PIN?" */}
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

                <Text style={styles.modalTitle}>What is a Duress PIN?</Text>
                <Text style={styles.modalSubtitle}>
                  A duress PIN is a special PIN that looks like a simple typing
                  mistake — but it silently activates your protection.
                </Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>
                        It looks normal to attackers.
                      </Text>{" "}
                      If they see you type it, they&apos;ll think you just
                      corrected a typo.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>
                        It triggers your safety protocol.
                      </Text>{" "}
                      The moment you enter it, the bank and police are alerted
                      with your location.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>It locks your funds.</Text>{" "}
                      Only your protection amount is available to transfer —
                      everything else is frozen.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>It&apos;s guaranteed.</Text>{" "}
                      Any amount transferred under duress is refunded by the
                      bank when you report it.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      Your normal banking remains completely unchanged. This is
                      your <Text style={styles.boldText}>silent lifeline</Text>{" "}
                      — only for emergencies.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* T&C Modal with internal checkbox and confirm-and-save */}
      <Modal
        transparent
        visible={termsModalVisible}
        animationType="none"
        onRequestClose={closeTermsModal}
      >
        <TouchableWithoutFeedback onPress={closeTermsModal}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: termsFadeAnim }]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalCard,
                  { transform: [{ scale: termsScaleAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeTermsModal}
                >
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Terms & Conditions</Text>
                <Text style={styles.modalSubtitle}>(Key Points)</Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Misuse is fraud.</Text> Only
                      use in genuine emergencies. False claims lead to{" "}
                      <Text style={styles.boldText}>
                        permanent deactivation and criminal charges
                      </Text>
                      .
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Keep it secret.</Text> Never
                      share your duress PIN. If forced to reveal it,{" "}
                      <Text style={styles.boldText}>
                        contact your bank immediately
                      </Text>{" "}
                      to reset it.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>
                        Refund guarantee — genuine only.
                      </Text>{" "}
                      You&apos;ll be fully refunded if used in a real emergency,
                      provided you{" "}
                      <Text style={styles.boldText}>
                        report within 72 hours with a police case number
                      </Text>
                      .
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>
                        False use is a criminal offence.
                      </Text>{" "}
                      Fraud, perjury, and wasting police resources carry{" "}
                      <Text style={styles.boldText}>
                        severe penalties including imprisonment
                      </Text>
                      .
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>
                        Report immediately if compromised.
                      </Text>{" "}
                      Accidental use or forced disclosure{" "}
                      <Text style={styles.boldText}>
                        must be reported promptly
                      </Text>{" "}
                      — failure may void your guarantee.
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalFooter}>
                  For full details, visit{" "}
                  <Text
                    style={[styles.linkText, { fontSize: 14 }]}
                    onPress={() =>
                      Linking.openURL("https://www.secureescape.ai")
                    }
                  >
                    www.secureescape.ai
                  </Text>
                </Text>

                <TouchableOpacity
                  style={styles.modalCheckRow}
                  onPress={() => setModalAgreed(!modalAgreed)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.modalCheckbox,
                      modalAgreed && styles.modalCheckboxChecked,
                    ]}
                  >
                    {modalAgreed && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.modalCheckText}>
                    I have read and agree to the Terms & Conditions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    (!modalAgreed || isSaving) && styles.modalConfirmDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={!modalAgreed || isSaving}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      modalAgreed ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]
                    }
                    style={styles.modalGradientButton}
                  >
                    <Text style={styles.buttonText}>
                      {isSaving ? "Saving..." : "Confirm & Agree"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
    marginTop: -20,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 16,
    padding: 14,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  enableButton: {
    marginTop: 8,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 20,
  },
  disabledButton: { opacity: 0.6 },
  gradientButton: { paddingVertical: 16, alignItems: "center" },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  boldText: { fontWeight: "700" },
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
  modalSubtitle: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 18,
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
  modalFooter: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 14,
    marginTop: 4,
  },
  modalCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.greyLine,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCheckboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalCheckText: {
    fontSize: 13,
    color: colors.textSub,
    flex: 1,
    lineHeight: 18,
  },
  modalConfirmButton: {
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 4,
  },
  modalConfirmDisabled: {
    opacity: 0.6,
  },
  modalGradientButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
});
