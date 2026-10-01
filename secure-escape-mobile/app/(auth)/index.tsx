import { useRouter } from "expo-router";
import LoginScreen from "@/screens/auth/LoginScreen";
import { useRouter } from "expo-router";

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    console.log("[AUTH ROUTE] Login successful — navigating to app");
    router.replace("/(tabs)");
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
