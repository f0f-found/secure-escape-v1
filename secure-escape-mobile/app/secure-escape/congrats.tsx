// app/secure-escape/congrats.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Congrats() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const lockShake = useRef(new Animated.Value(0)).current;

  const [confettiItems] = useState(() => {
    const items = [];
    const icons = ["✨", "⭐", "🌟", "💫", "⚡", "🔒"];
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    for (let i = 0; i < 12; i++) {
      const angle = angles[i % angles.length];
      const rad = (angle * Math.PI) / 180;
      const radius = 60 + Math.random() * 20;
      const startX = Math.cos(rad) * radius;
      const startY = Math.sin(rad) * radius;
      items.push({
        id: i,
        icon: icons[Math.floor(Math.random() * icons.length)],
        size: 16 + Math.random() * 8,
        startX,
        startY,
        delay: i * 100,
        duration: 800,
        angle,
      });
    }
    return items;
  });

  const [animations] = useState(() =>
    confettiItems.map(() => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(lockShake, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: 2, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: -2, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();

    confettiItems.forEach((item, idx) => {
      const anim = animations[idx];
      const rad = (item.angle * Math.PI) / 180;
      const outX = Math.cos(rad) * 100;
      const outY = Math.sin(rad) * 100;
      Animated.sequence([
        Animated.delay(item.delay),
        Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue: outX,
            duration: item.duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: outY,
            duration: item.duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 200,
            delay: item.duration - 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)");
  };

  const shakeInterpolate = lockShake.interpolate({
    inputRange: [-4, 4],
    outputRange: ["-4deg", "4deg"],
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.gradientHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Protection Active</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        {/* Shield + confetti */}
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.illustration,
              {
                transform: [{ scale: scaleAnim }, { rotate: shakeInterpolate }],
              },
            ]}
          >
            <LinearGradient colors={["#EDE9FE", "#DBEAFE"]} style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
            </LinearGradient>
          </Animated.View>

          {confettiItems.map((item, idx) => (
            <Animated.Text
              key={item.id}
              style={[
                styles.confettiIcon,
                {
                  fontSize: item.size,
                  left: width / 2 - 60 + item.startX,
                  top: 60 + item.startY,
                  transform: [
                    { translateX: animations[idx].translateX },
                    { translateY: animations[idx].translateY },
                  ],
                  opacity: animations[idx].opacity,
                },
              ]}
            >
              {item.icon}
            </Animated.Text>
          ))}
        </View>

        {/* Main content – clean and celebratory */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%", alignItems: "center" }}>
          <Text style={styles.mainTitle}>You&apos;re Protected</Text>

          <View style={styles.divider} />

          <Text style={styles.greeting}>Congratulations!</Text>
          <Text style={styles.message}>
            Your Silent Lifeline is ready – and it&apos;s completely invisible to everyone but you.
          </Text>

          {/* Security badge – trust signal */}
          <View style={styles.badgeContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            <Text style={styles.badgeText}>Bank‑guaranteed protection</Text>
          </View>

          {/* Tips – what you already liked */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={22} color={colors.primary} />
              <Text style={styles.tipText}>
                If you&apos;re ever forced to transact, stay calm. Enter your duress PIN and let the system work.
              </Text>
            </View>
            <View style={[styles.tipRow, { marginTop: 12 }]}>
              <Ionicons name="shield-outline" size={22} color={colors.primary} />
              <Text style={styles.tipText}>
                After you&apos;re safe, contact your bank with a police case number to get your protection amount refunded.
              </Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            Your normal banking remains unchanged. No one will know you&apos;re protected.
          </Text>

          <TouchableOpacity style={styles.okButton} onPress={handleGoHome}>
            <LinearGradient colors={["#7C6EF7", "#4A6CF7"]} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  illustration: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy || "#1A202C",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.textSub || "#718096",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
  },
  tipsContainer: {
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.greyLine || "#E2E8F0",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSub || "#718096",
    lineHeight: 20,
    flex: 1,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSub || "#718096",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 4,
  },
  okButton: {
    marginTop: 16,
    borderRadius: 50,
    overflow: "hidden",
    width: "80%",
    marginBottom: 20,
    alignSelf: "center",
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  confettiIcon: {
    position: "absolute",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
});