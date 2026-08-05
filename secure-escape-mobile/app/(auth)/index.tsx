import { useRouter } from "expo-router";
import SplashScreen from "@/screens/auth/SplashScreen";

export default function AuthIndex() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.push("/(auth)/pin-login");
  };

  const handleLoginSuccess = () => {
    router.replace("/(tabs)");
  };

  return <SplashScreen onLoginPress={handleLoginPress} />;
}
