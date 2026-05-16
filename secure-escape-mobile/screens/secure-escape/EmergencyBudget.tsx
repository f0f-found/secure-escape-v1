// app/secure-escape/emergency-budget.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function EmergencyBudgetScreen() {
  const router = useRouter();
  const { mode = "low" } = useLocalSearchParams<{ mode?: string }>();

  const [lowAmount, setLowAmount] = useState(200);
  const [tier1, setTier1] = useState(2000);
  const [tier2, setTier2] = useState(20000);
  const [agreed, setAgreed] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 0.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -0.05, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSliderChange = (value: number, type: "low" | "tier1" | "tier2") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === "low") setLowAmount(value);
    if (type === "tier1") setTier1(value);
    if (type === "tier2") setTier2(value);
  };

  const handleContinue = () => {
    if (!agreed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("Please agree to the Terms and Conditions");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/secure-escape/duress-pin");
  };

  const formatCurrency = (value: number) => `R ${value.toLocaleString()}`;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.05, 0.05],
    outputRange: ["-5deg", "5deg"],
  });

  let content;
  if (mode === "low") {
    content = (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.label}>
          Emergency Budget <Text style={styles.range}>(R200 – R1,000)</Text>
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
          Tier 1 – Instant transfer <Text style={styles.range}>(R500 – R5,000)</Text>
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
          Tier 2 – 24‑hour delayed <Text style={styles.range}>(up to R50,000)</Text>
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
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.gradientHeader}>
        <Text style={styles.backArrow} onPress={() => router.back()}>‹</Text>
        <Text style={styles.headerTitle}>Set Emergency Budget</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Secure Escape,</Text>
        <Text style={styles.sub}>
          This amount will be available to transfer if you&apos;re under duress.
        </Text>
        <TouchableOpacity>
          <Text style={styles.link}>what is the emergency budget?</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }, { rotate: rotateInterpolate }] },
          ]}
        >
          <LinearGradient colors={["#EDE9FE", "#DBEAFE"]} style={styles.iconCircle}>
            <Ionicons name="cash-outline" size={48} color={colors.primary} />
          </LinearGradient>
        </Animated.View>

        {content}

        {/* Checkbox with visible checkmark */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkboxBase, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
          <Text style={styles.checkText}>
            By setting an Emergency Budget you agree to our{" "}
            <Text
              style={styles.linkText}
              onPress={() => alert("Terms & Conditions would open here")}
            >
              Terms and Conditions
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, !agreed && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!agreed}
        >
          <LinearGradient
            colors={agreed ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  mainTitle: { fontSize: 28, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.textSub, marginBottom: 4, lineHeight: 20 },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  iconContainer: { alignItems: "center", marginVertical: 24 },
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
  label: { fontSize: 15, fontWeight: "600", color: colors.navy, marginBottom: 8 },
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
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.greyLine,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: { fontSize: 13, color: colors.textSub, flex: 1, lineHeight: 18 },
  linkText: { color: colors.primary, textDecorationLine: "underline" },
  continueButton: { marginTop: 12, borderRadius: 50, overflow: "hidden", marginBottom: 20 },
  disabledButton: { opacity: 0.6 },
  gradientButton: { paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});