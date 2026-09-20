import { useRouter } from "expo-router";
import LoginScreen from "@/screens/auth/LoginScreen";

export default function LoginRoute() {
	const router = useRouter();

	return <LoginScreen onLoginSuccess={() => router.replace("/(tabs)")} />;
}
