import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack, useRouter, useSegments } from "expo-router";

import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { useEffect, useState } from "react";

import { getAuthToken, isSessionExpired } from "@/services/tokenStore";

import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const segments = useSegments();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [segments]);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      const expired = await isSessionExpired();

      const inAuthGroup = segments[0] === "(auth)";

      // User is authenticated
      if (token && !expired) {
        if (inAuthGroup) {
          router.replace("/(tabs)");
        }
      }

      // User is NOT authenticated
      else {
        if (!inAuthGroup) {
          router.replace("/(auth)");
        }
      }
    } catch (error) {
      console.log("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen while checking auth
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts" />
        <Stack.Screen name="secure-escape" />
        <Stack.Screen name="beneficiaries" />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
