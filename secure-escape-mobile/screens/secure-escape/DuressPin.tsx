import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { setDuressPin } from "@/services/secureEscapeService";
import { colors } from "@/utils/theme";

export default function DuressPinScreen() {
  const router = useRouter();

  const [normalPin, setNormalPin] = useState("");
  const [duressPin, setDuressPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [normalPinError, setNormalPinError] = useState("");
  const [duressPinError, setDuressPinError] = useState("");
  const [confirmPinError, setConfirmPinError] = useState("");
  const [duressMatchesNormalError, setDuressMatchesNormalError] =
    useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const infoScaleAnim = useRef(new Animated.Value(0.9)).current;

  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const termsFadeAnim = useRef(new Animated.Value(0)).current;
  const termsScaleAnim = useRef(new Animated.Value(0.9)).current;
  const [modalAgreed, setModalAgreed] = useState(false);

  const openInfoModal = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const validateNormalPin = (pin: string) => {
    if (!pin) return "Current PIN is required.";
    if (!/^\d{4}$/.test(pin)) return "PIN must be exactly 4 digits.";
    return "";
  };

  const validateDuressPin = (pin: string) => {
    if (!pin) return "Duress PIN is required.";
    if (!/^\d{4}$/.test(pin)) return "PIN must be exactly 4 digits.";
    return "";
  };

  const validateConfirmPin = (pin: string, duress: string) => {
    if (!pin) return "Please confirm your duress PIN.";
    if (pin !== duress) return "PINs do not match.";
    return "";
  };

  const validatePinsAreDifferent = (duress: string, normal: string) => {
    if (
      duress.length === 4 &&
      normal.length === 4 &&
      duress === normal
    ) {
      return "Duress PIN must be different from your normal PIN.";
    }

    return "";
  };

  const handleNormalPinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);

    setNormalPin(cleaned);
    setNormalPinError(
      cleaned.length === 4 ? "" : validateNormalPin(cleaned),
    );

    setDuressMatchesNormalError(
      validatePinsAreDifferent(duressPin, cleaned),
    );
  };

  const handleDuressPinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);

    setDuressPinValue(cleaned);
    setDuressPinError(
      cleaned.length === 4 ? "" : validateDuressPin(cleaned),
    );

    if (confirmPin) {
      setConfirmPinError(validateConfirmPin(confirmPin, cleaned));
    }

    setDuressMatchesNormalError(
      validatePinsAreDifferent(cleaned, normalPin),
    );
  };

  const handleConfirmPinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);

    setConfirmPin(cleaned);

    if (cleaned.length === 4) {
      setConfirmPinError(validateConfirmPin(cleaned, duressPin));
    } else {
      setConfirmPinError(
        cleaned ? "PIN must be exactly 4 digits." : "",
      );
    }
  };

  const validateForm = () => {
    const normalError = validateNormalPin(normalPin);
    const duressError = validateDuressPin(duressPin);
    const confirmError = validateConfirmPin(confirmPin, duressPin);
    const samePinError = validatePinsAreDifferent(
      duressPin,
      normalPin,
    );

    setNormalPinError(normalError);
    setDuressPinError(duressError);
    setConfirmPinError(confirmError);
    setDuressMatchesNormalError(samePinError);

    return !(
      normalError ||
      duressError ||
      confirmError ||
      samePinError
    );
  };

  const handleEnable = () => {
    if (!validateForm()) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      return;
    }

    openTermsModal();
  };

  const handleConfirm = async () => {
    if (!modalAgreed || isSaving) {
      return;
    }

    if (!validateForm()) {
      closeTermsModal();
      return;
    }

    try {
      setIsSaving(true);

      await setDuressPin({
        currentPin: normalPin,
        duressPin,
      });

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );

      setTermsModalVisible(false);

      router.push("/secure-escape/emergency-contact?from=onboarding");
    } catch (error) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "We could not activate your duress PIN.";

      Alert.alert(
        "Could not activate protection",
        message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    normalPin.length === 4 &&
    duressPin.length === 4 &&
    confirmPin.length === 4 &&
    confirmPin === duressPin &&
    duressPin !== normalPin;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.gradientHeader}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Set Duress PIN</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Your Silent Safety Signal</Text>

        <Text style={styles.sub}>
          Create a separate PIN for situations where you are being
          forced to access your banking app. Using this PIN allows
          Secure Escape to silently start the duress response while
          keeping the banking experience discreet.
        </Text>

        <TouchableOpacity onPress={openInfoModal}>
          <Text style={styles.link}>What is a Duress PIN?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Enter your current PIN{" "}
          <Text style={styles.requiredAsterisk}>*</Text>
        </Text>

        <TextInput
          style={[
            styles.input,
            normalPinError ? styles.inputError : undefined,
          ]}
          secureTextEntry
          maxLength={4}
          keyboardType="number-pad"
          value={normalPin}
          onChangeText={handleNormalPinChange}
          placeholder="••••"
          placeholderTextColor="#A0AEC0"
          editable={!isSaving}
        />

        {!!normalPinError && (
          <Text style={styles.errorText}>{normalPinError}</Text>
        )}

        <Text style={styles.label}>
          Create your Duress PIN{" "}
          <Text style={styles.requiredAsterisk}>*</Text>
        </Text>

        <TextInput
          style={[
            styles.input,
            duressPinError || duressMatchesNormalError
              ? styles.inputError
              : undefined,
          ]}
          secureTextEntry
          maxLength={4}
          keyboardType="number-pad"
          value={duressPin}
          onChangeText={handleDuressPinChange}
          placeholder="••••"
          placeholderTextColor="#A0AEC0"
          editable={!isSaving}
        />

        {!!duressPinError && (
          <Text style={styles.errorText}>{duressPinError}</Text>
        )}

        {!!duressMatchesNormalError && (
          <Text style={styles.errorText}>
            {duressMatchesNormalError}
          </Text>
        )}

        <Text style={styles.label}>
          Confirm your Duress PIN{" "}
          <Text style={styles.requiredAsterisk}>*</Text>
        </Text>

        <TextInput
          style={[
            styles.input,
            confirmPinError ? styles.inputError : undefined,
          ]}
          secureTextEntry
          maxLength={4}
          keyboardType="number-pad"
          value={confirmPin}
          onChangeText={handleConfirmPinChange}
          placeholder="••••"
          placeholderTextColor="#A0AEC0"
          editable={!isSaving}
        />

        {!!confirmPinError && (
          <Text style={styles.errorText}>{confirmPinError}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.enableButton,
            (!isFormValid || isSaving) && styles.disabledButton,
          ]}
          onPress={handleEnable}
          disabled={!isFormValid || isSaving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isFormValid && !isSaving
                ? ["#25145F", "#25145F"]
                : ["#B8BEC9", "#B8BEC9"]
            }
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              Activate Silent Protection
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={infoModalVisible}
        animationType="none"
        onRequestClose={closeInfoModal}
      >
        <TouchableWithoutFeedback onPress={closeInfoModal}>
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: infoFadeAnim },
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalCard,
                  {
                    transform: [{ scale: infoScaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeInfoModal}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.navy}
                  />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  What is a Duress PIN?
                </Text>

                <Text style={styles.modalSubtitle}>
                  It is a separate emergency PIN designed for a
                  situation where someone is forcing you to access
                  your account.
                </Text>

                <View style={styles.bulletList}>
                  <InfoItem text="It looks like a normal banking PIN, helping the app remain discreet." />
                  <InfoItem text="Entering it at login creates a duress session for the Secure Escape response workflow." />
                  <InfoItem text="When location permission is available, your login location can be attached to the incident for the fraud team." />
                  <InfoItem text="Your normal PIN continues to open a normal banking session." />
                  <InfoItem text="Keep your duress PIN separate from your normal PIN and do not use it for ordinary banking." />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent
        visible={termsModalVisible}
        animationType="none"
        onRequestClose={() => {
          if (!isSaving) {
            closeTermsModal();
          }
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!isSaving) {
              closeTermsModal();
            }
          }}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: termsFadeAnim },
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalCard,
                  {
                    transform: [{ scale: termsScaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeTermsModal}
                  disabled={isSaving}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.navy}
                  />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  Confirm Duress PIN
                </Text>

                <Text style={styles.modalSubtitle}>
                  Before activating this feature, make sure you
                  understand how the emergency PIN should be used.
                </Text>

                <View style={styles.bulletList}>
                  <InfoItem text="Use your normal PIN for everyday banking." />
                  <InfoItem text="Use the duress PIN only when you need to silently activate the Secure Escape response." />
                  <InfoItem text="Your duress PIN must remain different from your normal PIN." />
                  <InfoItem text="If you believe either PIN has been compromised, contact your bank through its approved support process." />
                </View>

                <TouchableOpacity
                  style={styles.modalCheckRow}
                  onPress={() => {
                    if (!isSaving) {
                      setModalAgreed((current) => !current);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <View
                    style={[
                      styles.modalCheckbox,
                      modalAgreed &&
                        styles.modalCheckboxChecked,
                    ]}
                  >
                    {modalAgreed && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#fff"
                      />
                    )}
                  </View>

                  <Text style={styles.modalCheckText}>
                    I understand how my duress PIN should be used.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    (!modalAgreed || isSaving) &&
                      styles.modalConfirmDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={!modalAgreed || isSaving}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      modalAgreed && !isSaving
                        ? ["#25145F", "#25145F"]
                        : ["#B8BEC9", "#B8BEC9"]
                    }
                    style={styles.modalGradientButton}
                  >
                    {isSaving ? (
                      <View style={styles.savingRow}>
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>
                          Activating...
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>
                        Confirm & Continue
                      </Text>
                    )}
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

function InfoItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <Ionicons
        name="checkmark-circle"
        size={20}
        color={colors.primary}
      />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
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
  requiredAsterisk: {
    color: "#FF3B30",
    fontWeight: "700",
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
    marginBottom: 4,
  },
  enableButton: {
    marginTop: 24,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.65,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22,
    marginBottom: 18,
    paddingRight: 18,
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
    opacity: 0.65,
  },
  modalGradientButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
