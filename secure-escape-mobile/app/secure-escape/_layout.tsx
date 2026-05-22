import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { getProfileMe } from "@/services/profileService";

import { ActivityIndicator, View } from "react-native";

export default function SecureEscapeLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDuress, setIsDuress] = useState(false);

  useEffect(() => {
    checkSessionMode();
  }, []);

  const checkSessionMode = async () => {
    try {
      const profile = await getProfileMe();

      if (profile?.sessionMode === "Duress") {
        setIsDuress(true);
      }
    } catch (error) {
      console.log("Failed to check session mode", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Block access during duress sessions
  if (isDuress) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
