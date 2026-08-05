import React from "react";
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import BottomNav from "@/components/BottomNav";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
