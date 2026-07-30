import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
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
import { useRouter } from "expo-router";

export default function ModeSelection() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>();
  const [scaleLow] = useState(new Animated.Value(1));
  const [scaleReal] = useState(new Animated.Value(1));

  // Modal visibility & animations
  const [modalVisible, setModalVisible] = useState(false);
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

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

  // Modal handlers
  const openRiskModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeRiskModal = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(modalScaleAnim, {
        toValue: 0.9,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
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

        <TouchableOpacity onPress={openRiskModal}>
          <Text style={styles.link}>I don&apos;t know my risk level </Text>
        </TouchableOpacity>

        {/* Animated lock/shield icon in-between */}
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
              size={60}
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

      {/* Premium Modal for "I don't know my risk level" */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeRiskModal}
      >
        <TouchableWithoutFeedback onPress={closeRiskModal}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: modalFadeAnim }]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalCard,
                  { transform: [{ scale: modalScaleAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeRiskModal}
                >
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>SecureEscape</Text>
                <Text style={styles.modalSubtitle}>
                  If you&apos;re unsure, start with{" "}
                  <Text style={styles.boldText}>Low Profile Mode</Text>.
                </Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Low Profile Mode</Text>:
                      Best for most people. Shows a{" "}
                      <Text style={styles.boldText}>very low balance</Text> if
                      forced to transact. Good for{" "}
                      <Text style={styles.boldText}>
                        opportunistic crimes like hijackings or express
                        kidnappings
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
                      <Text style={styles.boldText}>Realistic Decoy Mode</Text>:
                      Best if you&apos;re a{" "}
                      <Text style={styles.boldText}>business owner</Text>, have
                      a <Text style={styles.boldText}>high income</Text>, or
                      believe{" "}
                      <Text style={styles.boldText}>
                        someone might be watching you
                      </Text>
                      . Shows a{" "}
                      <Text style={styles.boldText}>believable balance</Text> to
                      satisfy attackers who expect you to have money.
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalFooter}>
                  You can always{" "}
                  <Text style={styles.boldText}>change this later</Text> by
                  contacting your bank.
                </Text>
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
  sub: { fontSize: 14, color: colors.textSub, marginBottom: 2, lineHeight: 20 },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: "underline",
    marginBottom: 24,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 32,
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
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 18,
  },
  boldText: {
    fontWeight: "700",
    color: colors.navy,
  },
  bulletList: {
    marginBottom: 18,
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
  },
});
