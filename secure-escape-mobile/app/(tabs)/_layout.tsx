import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { setLastActivityNow } from "@/services/tokenStore";
import { HapticTab } from "@/components/haptic-tab";
import { TabIcon } from "@/components/TabIcon";

export default function TabLayout() {
  const tintColor = "#3B82F6";
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={setLastActivityNow}
      onTouchStart={setLastActivityNow}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tintColor,
          tabBarInactiveTintColor: "#A0AEC0",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <TabIcon name="home" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            title: "Cards",
            tabBarIcon: ({ color }) => (
              <TabIcon name="cards" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="transact"
          options={{
            title: "Transact",
            tabBarIcon: ({ color }) => (
              <TabIcon name="transact" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color }) => (
              <TabIcon name="messages" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <TabIcon name="settings" color={color} size={24} />
            ),
          }}
        />
      </Tabs>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
