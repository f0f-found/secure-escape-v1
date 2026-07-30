import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import {
  getAuthToken,
  isSessionExpired,
  clearAuthToken,
} from "@/services/tokenStore";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = await getAuthToken();
    const expired = await isSessionExpired();

    if (token && !expired) {
      router.replace("/(tabs)");
      return;
    }

    await clearAuthToken();
    router.replace("/(auth)");
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
