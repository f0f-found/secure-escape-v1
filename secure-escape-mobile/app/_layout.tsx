import { Stack, ThemeProvider, useRouter, useSegments } from "expo-router";

import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSessionActivity } from "@/hooks/use-session-activity";

import { useEffect, useState } from "react";

import { getAuthToken, isSessionExpired } from "@/services/tokenStore";

import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: "(auth)",
};

const lightTheme = {
  dark: false,
  colors: {
    primary: "rgb(0, 122, 255)",
    background: "rgb(242, 242, 247)",
    card: "rgb(255, 255, 255)",
    text: "rgb(28, 28, 30)",
    border: "rgb(216, 216, 220)",
    notification: "rgb(255, 59, 48)",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "800" as const },
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: "rgb(10, 132, 255)",
    background: "rgb(1, 1, 1)",
    card: "rgb(28, 28, 30)",
    text: "rgb(229, 229, 234)",
    border: "rgb(56, 56, 58)",
    notification: "rgb(255, 69, 58)",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "800" as const },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const segments = useSegments();
  const currentSegment = segments[0] ?? "";
  const recordActivity = useSessionActivity(segments.join("/"));

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        const expired = await isSessionExpired();

        const inAuthGroup = currentSegment === "(auth)";

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

    checkAuth();
  }, [currentSegment, router]);

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
    <ThemeProvider value={colorScheme === "dark" ? darkTheme : lightTheme}>
      <View style={{ flex: 1 }} onTouchStart={recordActivity} onTouchMove={recordActivity}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts/account-detail" />
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
      </View>
    </ThemeProvider>
  );
}
