// app/transactions/selfie-verification.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "@/utils/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createTransfer } from "@/services/transactionServices";
import { TransactionResponse } from "@/types/transaction";
import VerifyPinModal from "@/components/VerifyPinModal";

const { width } = Dimensions.get("window");
const PREVIEW_HEIGHT = 400;

export default function SelfieVerification() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    beneficiaryId: string;
    beneficiaryName: string;
    reference: string;
    amount: string;
    accountId: string;
    accountName: string;
  }>();

  const beneficiaryId = params.beneficiaryId || "";
  const beneficiaryName = params.beneficiaryName || "Beneficiary";
  const reference = params.reference || "";
  const amount = parseFloat(params.amount || "0");
  const accountId = params.accountId || "";
  const accountName = params.accountName || "";

  // Camera & capture
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Verification state
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  // Animations
  const scanAnim = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;

  // Transfer state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [createdTransaction, setCreatedTransaction] = useState<TransactionResponse | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);

  // Fake verification stages--this is our current limitation, as we don't have a real biometric verification backend yet. In a real app, this would be replaced with actual verification logic.
  const verificationMessages = [
    "Detecting face…",
    "Analysing facial landmarks…",
    "Checking image quality…",
    "Matching biometric profile…",
    "Confirming account holder…",
    "Identity verified",
  ];

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  // ----- Capture -----
  const takeSelfie = async () => {
    if (!cameraPermission?.granted) {
      Alert.alert("Permission needed", "Camera access is required to verify your identity.");
      return;
    }
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      setCapturedImage(photo.uri);
      startVerification();
    } catch (error) {
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  // ----- Simulated verification -----
  const startVerification = () => {
    setScanning(true);
    setVerified(false);
    setCurrentStep(0);
    setStatusMessage(verificationMessages[0]);

    checkOpacity.setValue(0);
    checkScale.setValue(0.5);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step < verificationMessages.length) {
        setStatusMessage(verificationMessages[step]);
      } else {
        clearInterval(interval);
        setScanning(false);
        setVerified(true);
        scanAnim.stopAnimation();
        setStatusMessage("Identity verified");

        Animated.parallel([
          Animated.timing(checkOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(checkScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 600);
  };

  // ----- Proceed: open PIN modal -----
  const handleProceed = () => {
    if (!verified) return;
    setVerifyVisible(true);
  };

  // ----- Submit transfer after PIN -----
  const handleVerifiedSubmit = async () => {
    setVerifyVisible(false);
    try {
      setSaving(true);
      clearError();
      const transaction = await createTransfer({
        bankAccountId: accountId,
        beneficiaryId: beneficiaryId,
        amount: amount,
        description: reference.trim() || "Payment",
      });

      if (transaction.status === "Failed" || transaction.status === "Blocked") {
        showError(
          transaction.statusReason ||
            "This transfer could not be processed. Please try a lower amount.",
        );
        return;
      }

      setCreatedTransaction(transaction);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ----- Scan line transform -----
  const scanLineTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PREVIEW_HEIGHT / 2 + 30, PREVIEW_HEIGHT / 2 - 30],
  });

  // ----- Render camera content -----
  const renderCameraContent = () => {
    const showOverlay = scanning;

    return (
      <>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            autofocus="on"
            animateShutter={false}
          />
        )}

        {showOverlay && <View style={styles.darkOverlay} pointerEvents="none" />}

        {(!capturedImage || scanning) && (
          <View style={styles.faceGuideContainer} pointerEvents="none">
            <View style={styles.oval} />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        )}

        {scanning && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineTranslate }] },
            ]}
          />
        )}

        {verified && (
          <Animated.View
            style={[
              styles.verifiedOverlay,
              {
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </Animated.View>
        )}

        <View style={styles.glassBanner} pointerEvents="none">
          <Ionicons name="lock-closed" size={16} color="#fff" />
          <Text style={styles.glassText}>Secure Biometric Verification</Text>
          {scanning && (
            <View style={styles.processingDot}>
              <View style={styles.pulseDot} />
            </View>
          )}
        </View>

        {!capturedImage && (
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={takeSelfie}
            activeOpacity={0.8}
          >
            <View style={styles.shutterOuter}>
              <View style={styles.shutterInner} />
            </View>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // ----- Permission handling -----
  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.whiteCard}>
          <Text style={styles.title}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.whiteCard}>
          {/* cast name to any to satisfy icon name union types */}
          <Ionicons name={"camera-off" as any} size={48} color={colors.textSub} />
          <Text style={styles.title}>Camera Access Required</Text>
          <Text style={styles.message}>
            Please grant camera permission to verify your identity.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <LinearGradient colors={["#7C6EF7", "#4A6CF7"]} style={styles.gradientButton}>
              <Text style={styles.buttonText}>verify identity</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ----- Main render (with ScrollView) -----
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.whiteCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Selfie Verification</Text>
          <Text style={styles.message}>
            Paying a large amount of{" "}
            <Text style={{ fontWeight: "bold" }}>R {amount.toLocaleString()}</Text>.
            {"\n\n"}Please take a selfie to verify your identity.
          </Text>

          <View style={styles.previewContainer}>
            {renderCameraContent()}
          </View>

          {statusMessage !== "" && (
            <View style={styles.statusContainer}>
              <Text style={styles.scanStatus}>{statusMessage}</Text>
              {scanning && (
                <View style={styles.progressDots}>
                  {verificationMessages.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        idx <= currentStep && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {createdTransaction ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Transfer submitted</Text>
              <Text style={styles.successText}>
                Status: {createdTransaction.status} • Ref:{" "}
                {createdTransaction.bankReference}
              </Text>
              {!!createdTransaction.secureEscapeCode && (
                <Text style={styles.successText}>
                  Secure Escape code: {createdTransaction.secureEscapeCode}
                </Text>
              )}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {error && (
                <TouchableOpacity
                  style={styles.errorBanner}
                  activeOpacity={0.8}
                  onPress={() => setShowErrorModal(true)}
                >
                  <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.proceedButton, !verified && styles.disabledButton]}
                onPress={handleProceed}
                disabled={!verified || saving}
              >
                <LinearGradient
                  colors={verified ? ["#7C6EF7", "#4A6CF7"] : ["#ccc", "#ccc"]}
                  style={styles.gradientButton}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {verified ? "Proceed with Payment" : "Verifying..."}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        onVerified={handleVerifiedSubmit}
        subtitle="Enter your PIN to send this transfer"
      />

      <Modal
        transparent
        visible={showErrorModal && !!error}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="alert-circle" size={30} color="#DC2626" />
            </View>
            <Text style={styles.errorModalTitle}>Transfer failed</Text>
            <Text style={styles.modalMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles – 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
    alignItems: "center",
  },
  iconContainer: { marginVertical: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  previewContainer: {
    width: "100%",
    height: PREVIEW_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 16,
    position: "relative",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  faceGuideContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  oval: {
    width: width * 0.55,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "rgba(255,255,255,0.8)",
    borderWidth: 2,
  },
  topLeft: {
    top: PREVIEW_HEIGHT / 2 - width * 0.35 - 10,
    left: width / 2 - width * 0.275 - 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: PREVIEW_HEIGHT / 2 - width * 0.35 - 10,
    right: width / 2 - width * 0.275 - 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: PREVIEW_HEIGHT / 2 - width * 0.35 - 10,
    left: width / 2 - width * 0.275 - 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: PREVIEW_HEIGHT / 2 - width * 0.35 - 10,
    right: width / 2 - width * 0.275 - 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#6C63FF",
    opacity: 0.9,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  verifiedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  glassBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  glassText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0.5,
    flex: 1,
  },
  processingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  shutterButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scanStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 6,
    minHeight: 24,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  proceedButton: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 4,
  },
  disabledButton: { opacity: 0.6 },
  gradientButton: { paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  permissionButton: {
    width: "80%",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
    width: "100%",
  },
  errorBannerText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorModalTitle: { fontSize: 18, fontWeight: "800", color: colors.navy, textAlign: "center" },
  modalMessage: { marginTop: 8, color: colors.textSub, fontSize: 14, lineHeight: 20, textAlign: "center" },
  modalButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  successBox: {
    marginTop: 22,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    width: "100%",
  },
  successTitle: { fontSize: 16, fontWeight: "800", color: "#166534" },
  successText: { marginTop: 4, fontSize: 13, color: "#3F6212" },
  doneButton: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 50, paddingVertical: 13, alignItems: "center" },
  doneButtonText: { color: "#fff", fontWeight: "800" },
});