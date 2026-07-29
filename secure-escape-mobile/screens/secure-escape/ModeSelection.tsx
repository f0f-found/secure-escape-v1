// screens/Screen4_ModeSelection.js - Better spacing + onboarding animation + "Recommended" badge
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

export default function ModeSelection() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>();
  const [riskModalVisible, setRiskModalVisible] = useState(false);
  const [scaleLow] = useState(new Animated.Value(1));
  const [scaleReal] = useState(new Animated.Value(1));

  // Animation for the lock icon (continuous pulse + rotation)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    // Gentle rotation for the lock (just a few degrees back and forth)
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

  const animateTap = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.97,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelect = (mode: string) => {
    setSelectedMode(mode);
    console.log(mode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleContinue = () => {
    if (selectedMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/secure-escape/emergency-budget",
        params: { profileType: selectedMode },
      });
    }
  };

  // Rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.05, 0.05],
    outputRange: ["-5deg", "5deg"],
  });

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
        <Text style={styles.headerTitle}>Choose Protection Mode</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <Text style={styles.mainTitle}>Secure Escape</Text>
        <Text style={styles.sub}>
          Hello there, Select the mode that matches your risk level
        </Text>
        <TouchableOpacity onPress={() => setRiskModalVisible(true)}>
          <Text style={styles.link}>I dont know my risk level?</Text>
        </TouchableOpacity>

        {/* Animated lock/shield icon in‑between */}
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
            <Ionicons
              name="shield-checkmark"
              size={48}
              color={colors.primary}
            />
          </LinearGradient>
        </Animated.View>

        {/* Low Profile Mode with "Recommended" badge */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            animateTap(scaleLow);
            handleSelect("LowProfile");
          }}
        >
          <Animated.View
            style={[
              styles.modeOption,
              selectedMode === "LowProfile" && styles.selected,
              { transform: [{ scale: scaleLow }] },
            ]}
          >
            <View style={styles.modeHeader}>
              <Text style={styles.modeTitle}>Low Profile Mode</Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            </View>
            <Text style={styles.modeDesc}>
              Shows a near-empty account balance under duress. Ideal for most
              users.
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Realistic Decoy Mode */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            animateTap(scaleReal);
            handleSelect("Custom");
          }}
        >
          <Animated.View
            style={[
              styles.modeOption,
              selectedMode === "Custom" && styles.selected,
              { transform: [{ scale: scaleReal }] },
            ]}
          >
            <Text style={styles.modeTitle}>Realistic Decoy Mode</Text>
            <Text style={styles.modeDesc}>
              Shows a believable balance based on spending patterns. For
              higher‑risk individuals.
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedMode && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedMode}
        >
          <LinearGradient
            colors={["#7C6EF7", "#4A6CF7"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Modal
        transparent
        visible={riskModalVisible}
        animationType="fade"
        onRequestClose={() => setRiskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setRiskModalVisible(false)}
            >
              <Ionicons name="close" size={22} color={colors.navy} />
            </TouchableOpacity>

            <View style={styles.modalIconWrapper}>
              <Ionicons
                name="shield-checkmark"
                size={40}
                color={colors.primary}
              />
            </View>

            <Text style={styles.modalTitle}>Which mode is right for me?</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalModeBlock}>
                <Text style={styles.modalModeTitle}>Low Profile Mode</Text>
                <Text style={styles.modalParagraph}>
                  Good for most people. If someone forces you to open the app,
                  they&apos;ll see a near-empty balance — nothing to take,
                  nothing to question. Simple and effective for everyday
                  situations.
                </Text>
              </View>

              <View style={styles.modalModeBlock}>
                <Text style={styles.modalModeTitle}>Realistic Decoy Mode</Text>
                <Text style={styles.modalParagraph}>
                  Better if you&apos;re at higher risk of being watched closely
                  — for example, if someone forcing you already knows roughly
                  how much money you have. Shows a believable balance based on
                  your actual spending patterns instead of an empty account, so
                  nothing looks obviously staged.
                </Text>
              </View>

              <Text style={styles.modalHint}>
                Not sure? Low Profile Mode is the safer default for most people.
              </Text>
            </ScrollView>
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
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 30, // increased from 20 to 24 (more spacing)
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
    padding: 28,
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
    marginBottom: 24,
  },

  // Animated icon in middle
  iconContainer: {
    alignItems: "center",
    marginVertical: 32, // added vertical spacing
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

  // Mode cards
  modeOption: {
    backgroundColor: colors.greyBg,
    borderWidth: 1.5,
    borderColor: colors.greyLine,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: "#F5F3FF",
    borderWidth: 2,
  },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    flexShrink: 1,
    marginRight: 10,
  },
  recommendedBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  modeDesc: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
    marginTop: 4,
  },

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
    textAlign: "center",
  },
  modalScroll: {
    width: "100%",
    marginBottom: 16,
  },
  modalModeBlock: {
    marginBottom: 18,
  },
  modalModeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },
  modalParagraph: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 21,
    textAlign: "left",
  },
  modalHint: {
    fontSize: 12,
    color: colors.textSub,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
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
  modalSecondaryButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalSecondaryText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});
