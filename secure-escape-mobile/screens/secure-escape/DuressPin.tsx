// screens/Screen6_DuressPin.js - Spacing fixed (everything moved down)
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
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { setDuressPin } from "@/services/secureEscapeService";

export default function DuressPin() {
  const router = useRouter();
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateCheck = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAgreed(!agreed);
  };

  const handleEnable = async () => {
    if (!agreed) {
      alert("You must agree to the Terms");
      return;
    }

    if (pin1 !== pin2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("PINs do not match");
      return;
    }

    try {
      setIsSaving(true);
      await setDuressPin({
        currentPassword,
        duressPin: pin1,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/secure-escape/emergency-contact?from=onboarding");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(
        error instanceof Error ? error.message : "Failed to set duress PIN.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isEnabled =
    pin1.length === 4 &&
    pin2.length === 4 &&
    pin1 === pin2 &&
    agreed &&
    currentPassword.length > 0;

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
        <Text style={styles.headerTitle}>Set Duress PIN</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.sub}>
          This is the PIN you should use ONLY when in duress
        </Text>
        <TouchableOpacity>
          <Text style={styles.link}>What is a Duress PIN?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter your password"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Enter your Duress PIN</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={pin1}
          onChangeText={setPin1}
          placeholder="••••••"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Re-enter your Duress PIN</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          maxLength={6}
          keyboardType="numeric"
          value={pin2}
          onChangeText={setPin2}
          placeholder="••••••"
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={animateCheck}
          style={styles.checkRow}
        >
          <Animated.View
            style={[
              styles.checkbox,
              agreed && styles.checked,
              { transform: [{ scale: scaleAnim }] },
            ]}
          />
          <Text style={styles.checkText}>
            By creating Duress PIN you agree to our{" "}
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.enableButton, !isEnabled && styles.disabledButton]}
          onPress={handleEnable}
          disabled={!isEnabled || isSaving}
        >
          <LinearGradient
            colors={isEnabled ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Saving..." : "Enable Duress PIN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  sub: { fontSize: 14, color: colors.textSub, marginBottom: 4, lineHeight: 20 },
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
    fontSize: 15,
    letterSpacing: 8,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { fontSize: 13, color: colors.textSub, flex: 1, lineHeight: 18 },
  linkText: { color: colors.primary, textDecorationLine: "underline" },
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
});
