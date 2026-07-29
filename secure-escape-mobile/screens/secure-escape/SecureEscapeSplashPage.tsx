import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function SecureEscapeSplashPage() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Modal animation
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();

    // Continuous pulse for the shield icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/secure-escape/mode-selection");
  };

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(modalScaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(modalScaleAnim, { toValue: 0.9, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start(() => setModalVisible(false));
  };

  // Floating circles (decorative)
  const circles = [
    { size: 120, top: 80, left: -40, opacity: 0.1, color: "#fff" },
    { size: 180, top: 200, right: -60, opacity: 0.08, color: "#fff" },
    { size: 90, bottom: 180, left: 30, opacity: 0.12, color: "#fff" },
    { size: 140, bottom: 60, right: -20, opacity: 0.07, color: "#fff" },
  ];

  return React.createElement(
    LinearGradient,
    {
      colors: ["#4A6CF7", "#6C63FF", "#00BCD4"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      style: styles.container,
    },
    React.createElement(
      TouchableOpacity,
      {
        style: styles.backButton,
        onPress: () => router.push("/(tabs)/settings"),
      },
      React.createElement(Ionicons, { name: "arrow-back", size: 24, color: "#fff" })
    ),
    ...circles.map((circle, idx) =>
      React.createElement(Animated.View, {
        key: idx,
        style: [
          styles.floatingCircle,
          {
            width: circle.size,
            height: circle.size,
            borderRadius: circle.size / 2,
            backgroundColor: circle.color,
            opacity: circle.opacity,
            top: circle.top,
            left: circle.left,
            right: circle.right,
            bottom: circle.bottom,
          },
        ],
      })
    ),
    React.createElement(
      Animated.View,
      { style: [styles.iconWrapper, { transform: [{ scale: pulseAnim }] }] },
      React.createElement(
        LinearGradient,
        { colors: ["#fff", "#f0f0ff"], style: styles.shieldCircle },
        React.createElement(Ionicons, { name: "shield-checkmark", size: 80, color: colors.primary })
      )
    ),
    React.createElement(
      Animated.View,
      { style: [styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }] },
      React.createElement(Text, { style: styles.title }, "SECURE ESCAPE"),
      React.createElement(Text, { style: styles.tagline }, "Silent protection when you need it most"),
      React.createElement(
        Text,
        { style: styles.description },
        "Set a duress PIN to silently alert the bank and police if you're ever forced to transact under threat."
      ),
      React.createElement(
        TouchableOpacity,
        { onPress: openModal },
        React.createElement(Text, { style: styles.learnMore }, "Learn More ")
      ),
      React.createElement(
        TouchableOpacity,
        { style: styles.continueButton, onPress: handlePress, activeOpacity: 0.8 },
        React.createElement(
          LinearGradient,
          {
            colors: ["#f7f7f8", "rgb(1, 23, 150)"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            style: styles.continueButtonGradient,
          },
          React.createElement(Text, { style: styles.continueButtonText }, "Continue"),
          React.createElement(Ionicons, {
            name: "arrow-forward",
            size: 20,
            color: "#fff",
            style: { marginLeft: 8 },
          })
        )
      )
    ),
    React.createElement(
      Modal,
      {
        transparent: true,
        visible: modalVisible,
        animationType: "none",
        onRequestClose: closeModal,
      },
      React.createElement(
        TouchableWithoutFeedback,
        { onPress: closeModal },
        React.createElement(
          Animated.View,
          { style: [styles.modalOverlay, { opacity: modalFadeAnim }] },
          React.createElement(
            TouchableWithoutFeedback,
            { onPress: (e) => e.stopPropagation() },
            React.createElement(
              Animated.View,
              { style: [styles.modalCard, { transform: [{ scale: modalScaleAnim }] }] },
              React.createElement(
                TouchableOpacity,
                { style: styles.closeButton, onPress: closeModal },
                React.createElement(Ionicons, { name: "close", size: 24, color: colors.navy })
              ),
              React.createElement(Text, { style: styles.modalTitle }, "SecureEscape"),
              React.createElement(
                Text,
                { style: styles.modalSubtitle },
                "gives you a silent lifeline. If you're ever forced to open your banking app under duress, entering your duress PIN will:"
              ),
              React.createElement(
                View,
                { style: styles.bulletList },
                React.createElement(
                  View,
                  { style: styles.bulletItem },
                  React.createElement(Ionicons, { name: "checkmark-circle", size: 20, color: colors.primary }),
                  React.createElement(
                    Text,
                    { style: styles.bulletText },
                    "Show attackers a realistic balance (not your real money)"
                  )
                ),
                React.createElement(
                  View,
                  { style: styles.bulletItem },
                  React.createElement(Ionicons, { name: "checkmark-circle", size: 20, color: colors.primary }),
                  React.createElement(
                    Text,
                    { style: styles.bulletText },
                    "Only make a small, bank‑guaranteed amount available"
                  )
                ),
                React.createElement(
                  View,
                  { style: styles.bulletItem },
                  React.createElement(Ionicons, { name: "checkmark-circle", size: 20, color: colors.primary }),
                  React.createElement(
                    Text,
                    { style: styles.bulletText },
                    "Silently alert police with your GPS location"
                  )
                ),
                React.createElement(
                  View,
                  { style: styles.bulletItem },
                  React.createElement(Ionicons, { name: "checkmark-circle", size: 20, color: colors.primary }),
                  React.createElement(
                    Text,
                    { style: styles.bulletText },
                    "Freeze the rest of your money for 72 hours"
                  )
                )
              ),
              React.createElement(
                Text,
                { style: styles.modalFooter },
                "The bank guarantees your safety buffer. You won't lose a cent if you report the incident within 72 hours with a police case number."
              )
            )
          )
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingCircle: {
    position: "absolute",
    opacity: 0.1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 10,
  },
  iconWrapper: {
    position: "absolute",
    top: height * 0.12,
    alignSelf: "center",
  },
  shieldCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    paddingHorizontal: 28,
    marginTop: height * 0.34,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 2,
    textAlign: "center",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    lineHeight: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 16,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: "90%",
  },
  learnMore: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: 8,
  },
  continueButton: {
    marginTop: 32,
    width: "100%",
    maxWidth: 280,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 17,
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
  bulletList: {
    marginBottom: 18,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
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