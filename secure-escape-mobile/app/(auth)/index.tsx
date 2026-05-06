import { useState } from "react";
import { useRouter } from "expo-router";
import { Modal, View } from "react-native";
import SplashScreen from "@/screens/auth/SplashScreen";
import LoginScreen from "@/screens/auth/LoginScreen";

export default function AuthIndex() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Navigate to dashboard/tabs
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Splash Screen */}
      <SplashScreen
        onServiceSelect={handleServiceSelect}
        onLoginPress={() => setShowLoginModal(true)}
      />

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </Modal>
    </View>
  );
}
