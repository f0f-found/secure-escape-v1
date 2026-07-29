import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
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
  const [infoModalVisible, setInfoModalVisible] = React.useState(false);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for the shield icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/secure-escape/mode-selection");
  };

  // Floating circles (decorative)
  const circles = [
    { size: 120, top: 80, left: -40, opacity: 0.1, color: "#fff" },
    { size: 180, top: 200, right: -60, opacity: 0.08, color: "#fff" },
    { size: 90, bottom: 180, left: 30, opacity: 0.12, color: "#fff" },
    { size: 140, bottom: 60, right: -20, opacity: 0.07, color: "#fff" },
  ];

  return (
    <LinearGradient
      colors={["#4A6CF7", "#6C63FF", "#00BCD4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/settings")}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      {/* Floating decorative circles */}
      {circles.map((circle, idx) => (
        <Animated.View
          key={idx}
          style={[
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
          ]}
        />
      ))}

      {/* Animated shield icon */}
      <Animated.View
        style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}
      >
        <LinearGradient
          colors={["#fff", "#f0f0ff"]}
          style={styles.shieldCircle}
        >
          <Ionicons name="shield-checkmark" size={80} color={colors.primary} />
        </LinearGradient>
      </Animated.View>

      {/* Text content (moved down) */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.title}>Secure Escape</Text>
        <Text style={styles.tagline}>
          Silent Protection{"\n"}When You Need It Most
        </Text>
        <Text style={styles.description}>
          Set a duress PIN to silently alert the bank and police if you&apos;re
          ever forced to transact under threat.
        </Text>
        <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
          <Text style={styles.learnMore}>Learn more →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Arrow button */}
      <TouchableOpacity style={styles.arrowButton} onPress={handlePress}>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
      <Modal
        transparent
        visible={infoModalVisible}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setInfoModalVisible(false)}
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

            <Text style={styles.modalTitle}>About Secure Escape</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalParagraph}>
                Secure Escape lets you set a second, secret PIN alongside your
                normal PIN. If you&apos;re ever forced to make a transaction
                under threat, entering your duress PIN instead of your normal
                one silently alerts the bank and your emergency contacts —
                without changing anything visible on your screen.
              </Text>

              <Text style={styles.modalParagraph}>
                The app continues to work exactly as normal for anyone watching.
                No alarms, no visible warnings, no sudden changes — just a quiet
                signal sent in the background so help can be sent your way.
              </Text>

              <Text style={styles.modalParagraph}>
                You can set up your duress PIN and manage your Secure Escape
                settings from this screen at any time.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end", // pushes content to bottom
    alignItems: "center",
  },
  floatingCircle: {
    position: "absolute",
    opacity: 0.1,
    backgroundColor: "#fff",
  },
  iconWrapper: {
    position: "absolute",
    top: height * 0.2, // 20% from top – central but high enough
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
    marginBottom: 80, // enough space from bottom
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
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 10,
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

  arrowButton: {
    position: "absolute",
    bottom: 36,
    right: 28,
    width: 56,
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  arrow: {
    fontSize: 24,
    color: colors.navy,
    fontWeight: "600",
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
    maxHeight: height * 0.7,
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
    marginBottom: 20,
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
