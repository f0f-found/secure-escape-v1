import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import VerifyPinModal from "@/components/VerifyPinModal";
import {
  createTransfer,
  uploadCurrentPhotoEvidence,
} from "@/services/transactionServices";
import { TransactionResponse } from "@/types/transaction";
import { colors } from "@/utils/theme";

const PREVIEW_HEIGHT = 400;

export default function SelfieVerification() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    transferType?: string;

    beneficiaryId?: string;
    beneficiaryName?: string;

    recipientName?: string;
    recipientBank?: string;
    recipientAccountNumber?: string;
    recipientAccountType?: string;
    recipientBranchCode?: string;

    reference?: string;
    amount?: string;
    accountId?: string;
    accountName?: string;
  }>();

  const isOnceOff = params.transferType === "onceOff";

  const beneficiaryId = params.beneficiaryId || "";
  const beneficiaryName = params.beneficiaryName || "";

  const recipientName = params.recipientName || "";
  const recipientBank = params.recipientBank || "";
  const recipientAccountNumber =
    params.recipientAccountNumber || "";
  const recipientAccountType =
    params.recipientAccountType || "";
  const recipientBranchCode =
    params.recipientBranchCode || "";

  const reference = params.reference || "";
  const amount = parseFloat(params.amount || "0");
  const accountId = params.accountId || "";
  const accountName = params.accountName || "";

  const payeeName = isOnceOff
    ? recipientName || "Recipient"
    : beneficiaryName || "Beneficiary";

  const [cameraPermission, requestPermission] =
    useCameraPermissions();

  const cameraRef = useRef<any>(null);

  const [capturedImage, setCapturedImage] = useState<
    string | null
  >(null);

  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] =
    useState(false);

  const [createdTransaction, setCreatedTransaction] =
    useState<TransactionResponse | null>(null);

  const [verifyVisible, setVerifyVisible] = useState(false);

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const takeSelfie = async () => {
    if (!cameraPermission?.granted) {
      Alert.alert(
        "Permission needed",
        "Camera access is required to complete this additional security step.",
      );
      return;
    }

    if (!cameraRef.current || capturing) {
      return;
    }

    try {
      setCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      setCapturedImage(photo.uri);
    } catch {
      Alert.alert(
        "Camera error",
        "The photo could not be captured. Please try again.",
      );
    } finally {
      setCapturing(false);
    }
  };

  const retakeSelfie = () => {
    setCapturedImage(null);
  };

  const handleProceed = () => {
    if (!capturedImage) {
      return;
    }

    setVerifyVisible(true);
  };

  const handleVerifiedSubmit = async () => {
    setVerifyVisible(false);

    if (!capturedImage) {
      showError(
        "The current photo is no longer available. Please take another photo.",
      );
      return;
    }

    try {
      setSaving(true);
      clearError();

      const transaction = await createTransfer(
        isOnceOff
          ? {
              bankAccountId: accountId,
              beneficiaryId: null,
              recipientName: recipientName.trim(),
              recipientBank: recipientBank.trim(),
              recipientAccountNumber:
                recipientAccountNumber.trim(),
              recipientAccountType:
                recipientAccountType.trim(),
              recipientBranchCode:
                recipientBranchCode.trim(),
              amount,
              description: reference.trim() || "Payment",
            }
          : {
              bankAccountId: accountId,
              beneficiaryId,
              amount,
              description: reference.trim() || "Payment",
            },
      );

      if (
        transaction.status === "Failed" ||
        transaction.status === "Blocked"
      ) {
        showError(
          transaction.statusReason ||
            "This transfer could not be processed.",
        );
        return;
      }

      await uploadCurrentPhotoEvidence(
        capturedImage,
        transaction.id,
      );

      setCreatedTransaction(transaction);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "The transfer could not be completed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={["#5B8DEF", "#6C63FF"]}
      style={styles.header}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>
        Additional Security
      </Text>

      <View style={styles.headerSpacer} />
    </LinearGradient>
  );

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.permissionCard}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.title}>
            Loading camera...
          </Text>
        </View>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.permissionCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="camera-outline"
              size={38}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            Camera Access Required
          </Text>

          <Text style={styles.message}>
            This payment requires an additional security
            confirmation. Allow camera access to take a current
            photo before continuing.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <LinearGradient
              colors={["#25145F", "#25145F"]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                Allow Camera
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.whiteCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={38}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            Confirm Your Presence
          </Text>

          <Text style={styles.message}>
            You're making a payment of{" "}
            <Text style={styles.boldText}>
              R {amount.toLocaleString()}
            </Text>
            {"\n"}to{" "}
            <Text style={styles.boldText}>
              {payeeName}
            </Text>
            .{"\n\n"}
            Take a current photo before continuing to PIN
            verification.
          </Text>

          {!!accountName && (
            <View style={styles.accountInfo}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={colors.primary}
              />

              <View style={styles.accountInfoText}>
                <Text style={styles.accountLabel}>
                  Paying from
                </Text>

                <Text style={styles.accountName}>
                  {accountName}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.previewContainer}>
            {capturedImage ? (
              <>
                <Image
                  source={{ uri: capturedImage }}
                  style={styles.previewImage}
                />

                <View style={styles.capturedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#166534"
                  />

                  <Text style={styles.capturedBadgeText}>
                    Photo captured
                  </Text>
                </View>
              </>
            ) : (
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="front"
                  autofocus="on"
                  animateShutter={false}
                />

                <View
                  style={styles.cameraOverlay}
                  pointerEvents="none"
                >
                  <View style={styles.faceGuide} />

                  <Text style={styles.cameraHint}>
                    Position your face within the guide
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={takeSelfie}
                  activeOpacity={0.85}
                  disabled={capturing}
                >
                  {capturing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {capturedImage && !createdTransaction && (
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakeSelfie}
                disabled={saving}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={18}
                  color={colors.navy}
                />

                <Text style={styles.retakeButtonText}>
                  Retake Photo
                </Text>
              </TouchableOpacity>

              <View style={styles.confirmationNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#475569"
                />

                <Text style={styles.confirmationNoteText}>
                  Your banking PIN is still required before the
                  payment can be submitted.
                </Text>
              </View>
            </View>
          )}

          {createdTransaction ? (
            <View style={styles.successBox}>
              <View style={styles.successHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#166534"
                />

                <Text style={styles.successTitle}>
                  Transfer submitted
                </Text>
              </View>

              <Text style={styles.successText}>
                Status: Successful
              </Text>

              <Text style={styles.successText}>
                Ref: {createdTransaction.bankReference}
              </Text>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.doneButtonText}>
                  Done
                </Text>
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
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color="#B91C1C"
                  />

                  <Text style={styles.errorBannerText}>
                    {error}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!capturedImage || saving) &&
                    styles.disabledButton,
                ]}
                onPress={handleProceed}
                disabled={!capturedImage || saving}
              >
                <LinearGradient
                  colors={
                    capturedImage
                      ? ["#25145F", "#25145F"]
                      : ["#CBD5E1", "#CBD5E1"]
                  }
                  style={styles.gradientButton}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {capturedImage
                        ? "Continue to PIN Verification"
                        : "Take Photo to Continue"}
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
        onRequestClose={() =>
          setShowErrorModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIconCircle}>
              <Ionicons
                name="alert-circle"
                size={30}
                color="#DC2626"
              />
            </View>

            <Text style={styles.errorModalTitle}>
              Transfer failed
            </Text>

            <Text style={styles.modalMessage}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={() =>
                setShowErrorModal(false)
              }
            >
              <Text style={styles.modalButtonText}>
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  headerSpacer: {
    width: 32,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
    alignItems: "center",
  },

  permissionCard: {
    flex: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  securityIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },

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
    lineHeight: 21,
  },

  boldText: {
    fontWeight: "800",
    color: colors.navy,
  },

  accountInfo: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  accountInfoText: {
    marginLeft: 10,
  },

  accountLabel: {
    fontSize: 11,
    color: colors.textSub,
    fontWeight: "600",
  },

  accountName: {
    marginTop: 2,
    fontSize: 14,
    color: colors.navy,
    fontWeight: "700",
  },

  previewContainer: {
    width: "100%",
    height: PREVIEW_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0F172A",
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

  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },

  faceGuide: {
    width: 220,
    height: 280,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },

  cameraHint: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "rgba(15,23,42,0.55)",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  shutterButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "rgba(15,23,42,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
  },

  capturedBadge: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(240,253,244,0.95)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  capturedBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
  },

  photoActions: {
    width: "100%",
    marginTop: 14,
  },

  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },

  retakeButtonText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "700",
  },

  confirmationNote: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
  },

  confirmationNoteText: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },

  primaryButton: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 18,
  },

  disabledButton: {
    opacity: 0.65,
  },

  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
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

  successBox: {
    marginTop: 22,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    width: "100%",
  },

  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  successTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
  },

  successText: {
    marginTop: 5,
    fontSize: 13,
    color: "#3F6212",
  },

  doneButton: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },

  doneButtonText: {
    color: "#fff",
    fontWeight: "800",
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

  errorModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },

  modalMessage: {
    marginTop: 8,
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  modalButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
