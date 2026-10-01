import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  usePathname,
  useRouter,
} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#25145F";
const WHITE = "#FFFFFF";
const TEXT_MUTED = "#8C8B96";
const BORDER = "#ECEBF1";
const TRANSACT_BG = "#F2EEFF";

const tabs = [
  {
    name: "Home",
    path: "/(tabs)",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "Cards",
    path: "/(tabs)/cards",
    icon: "card-outline",
    activeIcon: "card",
  },
  {
    name: "Transact",
    path: "/(tabs)/transact",
    icon: "swap-horizontal",
    activeIcon: "swap-horizontal",
    primary: true,
  },
  {
    name: "Messages",
    path: "/(tabs)/messages",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
  },
  {
    name: "Settings",
    path: "/(tabs)/settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const normalized =
    pathname.replace(/\/$/, "") || "/";

  const isActive = (
    tabPath: (typeof tabs)[number]["path"]
  ) => {
    if (tabPath === "/(tabs)") {
      return (
        normalized === "/" ||
        normalized === "/(tabs)" ||
        normalized === "/(tabs)/index"
      );
    }

    const destination =
      tabPath.replace("/(tabs)", "");

    return (
      normalized === tabPath ||
      normalized === destination
    );
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingBottom: Math.max(
            insets.bottom,
            6
          ),
        },
      ]}
    >
      <View style={styles.container}>
        {tabs.map((tab) => {
          const active = isActive(tab.path);

          const primary =
            "primary" in tab && tab.primary;

          const iconName = (
            active
              ? tab.activeIcon
              : tab.icon
          ) as keyof typeof Ionicons.glyphMap;

          return (
            <TouchableOpacity
              key={tab.path}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
              }}
              accessibilityLabel={tab.name}
              onPress={() => {
                if (!active) {
                  router.push(tab.path);
                }
              }}
            >
              {primary ? (
                <View
                  style={[
                    styles.transactButton,
                    active &&
                      styles.transactButtonActive,
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={23}
                    color={
                      active
                        ? WHITE
                        : PURPLE
                    }
                  />
                </View>
              ) : (
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={
                      active
                        ? PURPLE
                        : TEXT_MUTED
                    }
                  />
                </View>
              )}

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  active &&
                    styles.activeLabel,
                  primary &&
                    styles.primaryLabel,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,

    elevation: 6,
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 68,
    paddingHorizontal: 8,
    paddingTop: 8,
  },

  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 5,
  },

  iconWrapper: {
    height: 31,
    alignItems: "center",
    justifyContent: "center",
  },

  transactButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: TRANSACT_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },

  transactButtonActive: {
    backgroundColor: PURPLE,
  },

  label: {
    fontSize: 10,
    fontWeight: "500",
    color: TEXT_MUTED,
    marginTop: 3,
  },

  activeLabel: {
    color: PURPLE,
    fontWeight: "700",
  },

  primaryLabel: {
    marginTop: 3,
  },
});