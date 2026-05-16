import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
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
    router.push("/secure-escape/emergency-budget");
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
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.learnMore}>Learn more →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Arrow button */}
      <TouchableOpacity style={styles.arrowButton} onPress={handlePress}>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
//testing testing

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
});
