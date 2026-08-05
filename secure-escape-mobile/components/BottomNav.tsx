import { useRouter, usePathname } from "expo-router";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useEffect, useRef } from "react";

const tabs = [
  { name: "Home", path: "/(tabs)", icon: "home-outline" },
  { name: "Cards", path: "/(tabs)/cards", icon: "card-outline" },
  { name: "Transact", path: "/(tabs)/transact", icon: "swap-horizontal-outline" },
  { name: "Messages", path: "/(tabs)/messages", icon: "chatbubble-outline" },
  { name: "Settings", path: "/(tabs)/settings", icon: "settings-outline" },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const getTabBase = (path: string) => {
    if (path === "/(tabs)") return "/";
    return path.replace("/(tabs)", "").replace(/\/$/, "");
  };

  const isActive = (path: string) => {
    const base = getTabBase(path);
    const normalizedPath = pathname.replace(/\/$/, "");
    
    // Check both stripped base and full group path
    if (normalizedPath === base || normalizedPath === path) return true;
    
    // Special case for Home
    if (base === "/") {
      return (
        normalizedPath === "/" ||
        normalizedPath === "" ||
        normalizedPath === "/(tabs)" ||
        normalizedPath === "/(tabs)/index"
      );
    }
    return false;
  };

  const scaleAnims = useRef<Record<string, Animated.Value>>(
    tabs.reduce((acc, tab) => {
      acc[tab.path] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    tabs.forEach((tab) => {
      const active = isActive(tab.path);
      const anim = scaleAnims[tab.path];
      Animated.spring(anim, {
        toValue: active ? 1.2 : 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [pathname]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const iconName = active
            ? (tab.icon.replace("-outline", "") as keyof typeof Ionicons.glyphMap)
            : (tab.icon as keyof typeof Ionicons.glyphMap);

          return (
            <TouchableOpacity
              key={tab.path}
              style={styles.tab}
              onPress={() => router.push(tab.path)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  active && styles.activeIconWrapper,
                  { transform: [{ scale: scaleAnims[tab.path] }] },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={active ? colors.primary : colors.textSub}
                />
              </Animated.View>
              <Text
                style={[
                  styles.label,
                  active && styles.activeLabel,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 8,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 56,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 2,
  },
  activeIconWrapper: {
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSub || "#718096",
    marginTop: 1,
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: colors.primary || "#3B82F6",
    fontWeight: "700",
  },
});