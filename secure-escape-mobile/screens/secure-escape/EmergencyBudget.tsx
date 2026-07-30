import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { upsertDecoyProfile } from "@/services/secureEscapeService";
import { ErrorBanner, ErrorModal } from "@/components/FormErrorMessage";

export default function EmergencyBudgetScreen() {
  const router = useRouter();
  const { profileType } = useLocalSearchParams<{
    profileType?: "LowProfile" | "Custom";
  }>();
  const mode = profileType;

  const [lowAmount, setLowAmount] = useState(200);
  const [tier1, setTier1] = useState(2000);
  const [tier2, setTier2] = useState(20000);
  // Display balance no longer has its own slider in this design — for
  // Custom mode we default it to Tier 1 (the amount an attacker would
  // initially see as available). Flagging this as an assumption; adjust
  // if "what attacker sees" should be a separate, independently-set value.
  const [displayBalance, setDisplayBalance] = useState(500);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Protection Amount info modal
  const [protectionModalVisible, setProtectionModalVisible] = useState(false);
  const protectionFadeAnim = useRef(new Animated.Value(0)).current;
  const protectionScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Terms & Conditions modal
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const termsFadeAnim = useRef(new Animated.Value(0)).current;
  const termsScaleAnim = useRef(new Animated.Value(0.9)).current;
  const [modalAgreed, setModalAgreed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.05,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleSliderChange = (
    value: number,
    type: "low" | "tier1" | "tier2",
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();
    if (type === "low") setLowAmount(value);
    if (type === "tier1") {
      setTier1(value);
      if (mode === "Custom") setDisplayBalance(value);
    }
    if (type === "tier2") setTier2(value);
  };

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const getValidationMessage = () => {
    if (profileType !== "LowProfile" && profileType !== "Custom") {
      return "Please choose a Secure Escape mode before setting your protection amount.";
    }

    const values =
      mode === "LowProfile" ? [lowAmount] : [displayBalance, tier1, tier2];

    if (values.some((value) => value < 0 || value > 1000000)) {
      return "Secure Escape amounts must be between R0 and R1,000,000.";
    }

    return null;
  };

  // Continue: validate sliders, then open T&C modal
  const handleContinue = () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(validationMessage);
      return;
    }

    openTermsModal();
  };

  // Protection Amount modal handlers
  const openProtectionModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProtectionModalVisible(true);
    Animated.parallel([
      Animated.timing(protectionFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(protectionScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeProtectionModal = () => {
    Animated.parallel([
      Animated.timing(protectionFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(protectionScaleAnim, {
        toValue: 0.9,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => setProtectionModalVisible(false));
  };

  // T&C modal handlers
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

  // Confirm & Agree inside the modal: actually saves and navigates
  const handleConfirm = async () => {
    if (!modalAgreed) return;

    try {
      setIsSaving(true);
      clearError();

      await upsertDecoyProfile({
        profileType: profileType ?? "LowProfile",
        displayBalance: mode === "LowProfile" ? lowAmount : displayBalance,
        emergencyBudget: mode === "LowProfile" ? lowAmount : tier1,
        tier1Limit: mode === "LowProfile" ? lowAmount : tier1,
        tier2Limit: mode === "LowProfile" ? lowAmount : tier2,
        tier2DelayHours: 24,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeTermsModal();
      router.push("/secure-escape/duress-pin");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      closeTermsModal();
      showError(
        err instanceof Error
          ? err.message
          : "Failed to save Secure Escape setup",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => `R ${value.toLocaleString()}`;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.05, 0.05],
    outputRange: ["-5deg", "5deg"],
  });

  let content;
  if (profileType === "LowProfile") {
    content = (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.label}>
          Protection Amount <Text style={styles.range}>(R200 – R1,000)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={200}
          maximumValue={1000}
          step={10}
          value={lowAmount}
          onValueChange={(v: number) => handleSliderChange(v, "low")}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.greyLine}
          thumbTintColor={colors.primary}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Suggested: R200</Text>
          <Text style={styles.value}>{formatCurrency(lowAmount)}</Text>
        </View>
        <Text style={styles.hint}>
          This is the amount an attacker can force you to send. The money will
          actually leave your account, but the rest will be locked.
        </Text>
      </Animated.View>
    );
  } else {
    content = (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.label}>
          Protection Amount – Tier 1{" "}
          <Text style={styles.range}>(R500 – R5,000)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={500}
          maximumValue={5000}
          step={50}
          value={tier1}
          onValueChange={(v: number) => handleSliderChange(v, "tier1")}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.greyLine}
          thumbTintColor={colors.primary}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Instant transfer amount</Text>
          <Text style={styles.value}>{formatCurrency(tier1)}</Text>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>
          Protection Amount – Tier 2{" "}
          <Text style={styles.range}>(up to R50,000)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50000}
          step={500}
          value={tier2}
          onValueChange={(v: number) => handleSliderChange(v, "tier2")}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.greyLine}
          thumbTintColor={colors.primary}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Delayed transfer amount</Text>
          <Text style={styles.value}>{formatCurrency(tier2)}</Text>
        </View>
        <Text style={styles.hint}>
          Tier 1 is immediately available. Tier 2 is delayed by 24 hours to give
          authorities time. The rest of your funds are frozen.
        </Text>
      </Animated.View>
    );
  }

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
        <Text style={styles.headerTitle}>Set Protection Amount</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Secure Escape,</Text>
        <Text style={styles.sub}>Set your protection amount</Text>
        <Text style={styles.subDescription}>
          This amount is fully insured by the bank. If you&apos;re forced to
          transact under duress, this is the maximum that can leave your
          account.
        </Text>
        <TouchableOpacity onPress={openProtectionModal}>
          <Text style={styles.link}>What is the protection amount? </Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }, { rotate: rotateInterpolate }],
            },
          ]}
        >
          <LinearGradient
            colors={["#EDE9FE", "#DBEAFE"]}
            style={styles.iconCircle}
          >
            <Ionicons name="cash-outline" size={60} color={colors.primary} />
          </LinearGradient>
        </Animated.View>

        {content}

        <View style={styles.noteBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            <Text style={styles.boldText}>Note:</Text> This is the amount an
            attacker can force you to send. It will leave your account, but
            it&apos;s fully insured and guaranteed to be refunded by the bank.
            Your safety is the priority.
          </Text>
        </View>

        <ErrorBanner message={error} onPress={() => setShowErrorModal(true)} />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#7C6EF7", "#4A6CF7"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ErrorModal
        title="Secure Escape setup"
        message={error}
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Modal: "What is the protection amount?" */}
      <Modal
        transparent
        visible={protectionModalVisible}
        animationType="none"
        onRequestClose={closeProtectionModal}
      >
        <TouchableWithoutFeedback onPress={closeProtectionModal}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: protectionFadeAnim }]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalCard,
                  { transform: [{ scale: protectionScaleAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeProtectionModal}
                >
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Protection Amount</Text>
                <Text style={styles.modalSubtitle}>
                  This is the amount that will be available to transfer if
                  you&apos;re forced to transact.
                </Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      It is{" "}
                      <Text style={styles.boldText}>
                        guaranteed by the bank
                      </Text>
                      . You will be{" "}
                      <Text style={styles.boldText}>
                        refunded within 72 hours
                      </Text>{" "}
                      of reporting the incident with a police case number.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      It{" "}
                      <Text style={styles.boldText}>
                        satisfies the attacker
                      </Text>
                      . The money{" "}
                      <Text style={styles.boldText}>
                        actually leaves your account
                      </Text>
                      , so the attacker believes they&apos;ve succeeded —
                      keeping you safe.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>The rest is locked</Text>.
                      Everything above this amount is frozen and protected.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      The{" "}
                      <Text style={styles.boldText}>
                        bank and police are silently alerted
                      </Text>{" "}
                      the moment your duress PIN is used.
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
                      <Text style={styles.boldText}>Refund guarantee:</Text> Any
                      transaction made using the duress PIN up to the protection
                      amount will be refunded by the bank within 72 hours of the
                      victim reporting the incident and providing a valid police
                      case number.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Fraud prevention:</Text>{" "}
                      False claims of duress constitute fraud and will result in
                      legal action, permanent feature ban, and potential
                      criminal charges.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Reporting window:</Text> The
                      victim must report the incident within 72 hours of the
                      duress event. Beyond this window, refunds are at the
                      bank&apos;s discretion.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Bank discretion:</Text> The
                      bank reserves the right to investigate each claim and may
                      deny refunds if evidence suggests fraud or
                      misrepresentation.
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
  scrollContent: { paddingBottom: 40 },
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
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 4,
    lineHeight: 22,
  },
  subDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
    marginBottom: 6,
  },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 8,
  },
  range: { fontWeight: "400", color: colors.textSub, fontSize: 12 },
  slider: { width: "100%", height: 40, marginBottom: 8 },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  valueLabel: { fontSize: 13, color: colors.textSub },
  value: { fontSize: 18, fontWeight: "800", color: colors.primary },
  hint: {
    fontSize: 12,
    color: colors.textSub,
    backgroundColor: "#F8F9FC",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    lineHeight: 18,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
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
  linkText: { color: colors.primary, textDecorationLine: "underline" },
  continueButton: {
    marginTop: 12,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 20,
  },
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
