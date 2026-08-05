import { useRouter } from "expo-router";
import LoginScreen from "@/screens/auth/LoginScreen";

export default function AuthIndex() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.replace("/(tabs)");
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
