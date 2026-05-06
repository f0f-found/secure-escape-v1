import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const colors = {
  primary: "#5856D6",
  background: "#FAFBFC",
  surface: "#FFFFFF",
  text: "#1A202C",
  textSecondary: "#718096",
  border: "#E2E8F0",
};

const services = [
  {
    id: "transfers",
    name: "Transfers",
    icon: "💰",
    color: "#FF6B6B",
  },
  {
    id: "cards",
    name: "Cards",
    icon: "💳",
    color: "#10B981",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: "🔔",
    color: "#F59E0B",
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    color: "#5856D6",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
    color: "#00D4FF",
  },
  {
    id: "profile",
    name: "Profile",
    icon: "👤",
    color: "#FF9500",
  },
];

interface SplashScreenProps {
  onServiceSelect?: (serviceId: string) => void;
  onLoginPress: () => void;
}

export default function SplashScreen({
  onServiceSelect,
  onLoginPress,
}: SplashScreenProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleServicePress = (serviceId: string) => {
    onServiceSelect?.(serviceId);
    onLoginPress(); // Open login modal
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.brandBox}>
            <Text style={styles.brandIcon}>🏦</Text>
          </View>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>Welcome to your banking hub</Text>
        </Animated.View>

        {/* Services Grid */}
        <Animated.View
          style={[
            styles.servicesContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServicePress(service.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.serviceIconBox,
                    { backgroundColor: service.color + "20" },
                  ]}
                >
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Login Button */}
        <Animated.View
          style={[
            styles.loginButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLoginPress}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Navigation */}
        {/* <Animated.View
          style={[
            styles.bottomNav,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🔗</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>👥</Text>
          </TouchableOpacity>
        </Animated.View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  brandIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  // Services Grid
  servicesContainer: {
    marginBottom: 30,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },

  // Login Button
  loginButtonContainer: {
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  navItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navIcon: {
    fontSize: 20,
  },
});
