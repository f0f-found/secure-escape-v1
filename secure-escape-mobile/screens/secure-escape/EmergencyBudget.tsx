import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
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
  const [displayBalance, setDisplayBalance] = useState(500);
  const [tier1, setTier1] = useState(2000);
  const [tier2, setTier2] = useState(20000);
  const [agreed, setAgreed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Animation for the icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Continuous pulse animation loop
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

    // Gentle rotation
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
    if (type === "tier1") setTier1(value);
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
      return "Please choose a Secure Escape mode before setting your emergency budget.";
    }

    if (!agreed) {
      return "Please agree to the Terms and Conditions before continuing.";
    }

    const values =
      mode === "LowProfile" ? [lowAmount] : [displayBalance, tier1, tier2];

    if (values.some((value) => value < 0 || value > 1000000)) {
      return "Secure Escape amounts must be between R0 and R1,000,000.";
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
      setIsSaving(true);
      clearError();

      await upsertDecoyProfile({
        profileType: profileType ?? "LowProfile",
        displayBalance: lowAmount,
        emergencyBudget: mode === "LowProfile" ? lowAmount : tier1,
        tier1Limit: mode === "LowProfile" ? lowAmount : tier1,
        tier2Limit: mode === "LowProfile" ? lowAmount : tier2,
        tier2DelayHours: 24,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/secure-escape/duress-pin");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError(
        error instanceof Error
          ? error.message
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
        {/* <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2000}
          step={50}
          value={displayBalance}
          onValueChange={(v: number) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            clearError();
            setDisplayBalance(v);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.greyLine}
          thumbTintColor={colors.primary}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>What attacker sees</Text>
          <Text style={styles.value}>{formatCurrency(displayBalance)}</Text>
        </View> */}
        <Text style={styles.label}>
          Emergency Budget <Text style={styles.range}>(R0 – R1,000)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
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
          Display Balance <Text style={styles.range}>(R1,000 – R20,000)</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1000}
          maximumValue={20000}
          step={500}
          value={displayBalance}
          onValueChange={(v: number) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDisplayBalance(v);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.greyLine}
          thumbTintColor={colors.primary}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>What attacker sees</Text>
          <Text style={styles.value}>{formatCurrency(displayBalance)}</Text>
        </View>
        <Text style={styles.label}>
          Tier 1 – Instant transfer{" "}
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
          Tier 2 – 24‑hour delayed{" "}
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
        <Text style={styles.backArrow} onPress={() => router.back()}>
          ‹
        </Text>
        <Text style={styles.headerTitle}>Set Emergency Budget</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Secure Escape,</Text>
        <Text style={styles.sub}>
          This amount will be available to transfer if you&apos;re under duress.
        </Text>
        <TouchableOpacity onPress={() => setBudgetModalVisible(true)}>
          <Text style={styles.link}>what is the emergency budget?</Text>
        </TouchableOpacity>

        {/* Animated money/security icon */}
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
            <Ionicons name="cash-outline" size={48} color={colors.primary} />
          </LinearGradient>
        </Animated.View>

        {content}

        {/* Checkbox with terms */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => {
            setAgreed(!agreed);
            clearError();
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checked]} />
          <Text style={styles.checkText}>
            By setting an Emergency Budget you agree to our{" "}
            <Text
              style={styles.linkText}
              onPress={() => setTermsModalVisible(true)}
            >
              Terms and Conditions
            </Text>
          </Text>
        </TouchableOpacity>

        <ErrorBanner message={error} onPress={() => setShowErrorModal(true)} />

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!agreed || isSaving) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          <LinearGradient
            colors={agreed ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Saving..." : "Continue"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ErrorModal
        title="Secure Escape setup"
        message={error}
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
      <Modal
        transparent
        visible={budgetModalVisible}
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setBudgetModalVisible(false)}
            >
              <Ionicons name="close" size={22} color={colors.navy} />
            </TouchableOpacity>

            <View style={styles.modalIconWrapper}>
              <Ionicons name="cash-outline" size={36} color={colors.primary} />
            </View>

            <Text style={styles.modalTitle}>What is the emergency budget?</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalParagraph}>
                Your emergency budget is the amount that&apos;s allowed to leave
                your account if you&apos;re ever forced to transact under
                duress. It&apos;s real money and it will actually be sent — but
                everything above that amount stays locked, out of reach.
              </Text>
              <Text style={styles.modalParagraph}>
                Set it low enough that losing it wouldn&apos;t be devastating,
                but high enough to look believable to someone demanding money
                from you. Whatever mode you&apos;re in — Low Profile or
                Realistic Decoy — this is the ceiling on what can actually be
                taken.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setBudgetModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={termsModalVisible}
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Ionicons name="close" size={22} color={colors.navy} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Terms and Conditions</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalParagraph}>
                By setting an Emergency Budget, you agree that the specified
                amount may be transferred out of your account when your Secure
                Escape duress PIN is used. This transfer is real and
                irreversible through the app.
              </Text>
              <Text style={styles.modalParagraph}>
                Secure Escape is designed to help in situations of coercion or
                threat. Misuse of this feature, including setting it up to
                disguise unrelated transactions, is not supported and may affect
                your account standing.
              </Text>
              <Text style={styles.modalParagraph}>
                You can update your emergency budget and Secure Escape settings
                at any time from the Secure Escape section of your app.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  gradientHeader: {
    paddingTop: 65, // increased to push title down
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: colors.textSub, marginBottom: 4, lineHeight: 20 },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: "underline",
    marginBottom: 20,
  },

  // Animated icon
  iconContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },

  // Sliders and budget content
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

  // Checkbox
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.greyLine,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    fontSize: 13,
    color: colors.textSub,
    flex: 1,
    lineHeight: 18,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },

  // Continue button
  continueButton: {
    marginTop: 12,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0EFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    marginBottom: 16,
    marginTop: 8,
    textAlign: "center",
  },
  modalScroll: {
    width: "100%",
    marginBottom: 16,
  },
  modalParagraph: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 21,
    marginBottom: 14,
    textAlign: "left",
  },
  modalDoneButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalDoneText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
