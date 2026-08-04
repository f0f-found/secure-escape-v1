// app/(tabs)/card-detail.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Switch,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

export default function CardDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const card = params.card ? JSON.parse(params.card as string) : null;

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);

  const [freezeCard, setFreezeCard] = useState(false);
  const [onlinePurchases, setOnlinePurchases] = useState(true);
  const [internationalTransactions, setInternationalTransactions] = useState(true);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleShowDetails = () => setWarningModalVisible(true);
  const handleWarningConfirm = () => {
    setWarningModalVisible(false);
    setPin("");
    setPinModalVisible(true);
  };

  const handlePinConfirm = () => {
    if (pin.length !== 5 || !/^\d{5}$/.test(pin)) {
      Alert.alert("Invalid PIN", "Please enter your 5‑digit PIN.");
      return;
    }
    setPinModalVisible(false);
    flipCard();
  };

  const handleFreezeToggle = (value: boolean) => {
    if (value) setFreezeModalVisible(true);
    else {
      setFreezeCard(false);
      Alert.alert("Card Unfrozen", "Your card is now active and can be used normally.");
    }
  };
  const confirmFreeze = () => {
    setFreezeCard(true);
    setFreezeModalVisible(false);
    Alert.alert("Card Frozen", "No payments, subscriptions or withdrawals can be made while it's frozen.");
  };

  const handleOnlinePurchases = (value: boolean) => {
    setOnlinePurchases(value);
    Alert.alert(
      value ? "Online Purchases Enabled" : "Online Purchases Disabled",
      value
        ? "You can now use your card for online shopping."
        : "Online purchases have been disabled."
    );
  };

  const handleInternational = (value: boolean) => {
    setInternationalTransactions(value);
    Alert.alert(
      value ? "International Transactions Enabled" : "International Transactions Disabled",
      value
        ? "Your card can now be used for international transactions."
        : "International transactions disabled."
    );
  };

  const handleTapToPay = () =>
    Alert.alert(
      "Tap to Pay",
      "Tap your card on any contactless payment terminal to pay.\n\nThis feature is already enabled on your card."
    );

  const handleReplaceStop = () =>
    Alert.alert(
      "Replace or Stop Card",
      "Choose an option:\n\n1. Report lost/stolen\n2. Replace damaged card\n3. Cancel card permanently",
      [
        {
          text: "Report Lost",
          style: "destructive",
          onPress: () => Alert.alert("Reported", "We've blocked your card. A new one will be issued."),
        },
        { text: "Replace", onPress: () => Alert.alert("Replacement", "A new card will be sent to your branch.") },
        { text: "Cancel", style: "cancel" },
      ]
    );

  const handleUpdateLimits = () => {
    Alert.alert("Coming Soon", "Update permanent limits will be available in the next sprint.");
  };

  const handleTempLimits = () => {
    Alert.alert("Coming Soon", "Set temporary limits will be available in the next sprint.");
  };

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cards</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          <View style={styles.cardContainer}>
            {/* FRONT SIDE */}
            <Animated.View
              style={[
                styles.flipCard,
                { transform: [{ rotateY: frontInterpolate }] },
                { pointerEvents: isFlipped ? "none" : "auto" },
              ]}
            >
              <LinearGradient colors={card.gradient} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{card.status}</Text>
                  </View>
                </View>
                <Text style={styles.cardNumber}>{card.displayNumber || card.number}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardBank}>{card.bank}</Text>
                    <Text style={styles.cardHolder}>{card.holder}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountNumber}>{card.accountNumber}</Text>
                    <Text style={styles.accountType}>{card.accountType}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.detailsButton} onPress={handleShowDetails}>
                  <Text style={styles.detailsButtonText}>Show card details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>

            {/* BACK SIDE */}
            <Animated.View
              style={[
                styles.flipCard,
                styles.backCard,
                { transform: [{ rotateY: backInterpolate }] },
                { pointerEvents: isFlipped ? "auto" : "none" },
              ]}
            >
              <LinearGradient colors={card.gradient} style={[styles.card, styles.cardBack]}>
                <View style={styles.backContent}>
                  {[
                    { label: "Card Number", value: card.number },
                    { label: "Expiry", value: card.expiry },
                    { label: "CVV", value: card.cvv },
                    { label: "Account Number", value: card.accountNumber },
                    { label: "Account Type", value: card.accountType },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.flipBackButton} onPress={flipCard}>
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.flipBackText}>Flip back</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>

        {/* Toggles and Actions */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Freeze card</Text>
              <Text style={styles.toggleDescription}>
                Lost or misplaced your card? No transactions can be done while it&apos;s frozen.
              </Text>
            </View>
            <Switch
              value={freezeCard}
              onValueChange={handleFreezeToggle}
              trackColor={{ false: "#ddd", true: colors.primary }}
              thumbColor={freezeCard ? "#fff" : "#fff"}
            />
          </View>
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Online purchases</Text>
              <Text style={styles.toggleDescription}>Use your card to shop online</Text>
            </View>
            <Switch
              value={onlinePurchases}
              onValueChange={handleOnlinePurchases}
              trackColor={{ false: "#ddd", true: colors.primary }}
              thumbColor={onlinePurchases ? "#fff" : "#fff"}
            />
          </View>
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>International transactions</Text>
              <Text style={styles.toggleDescription}>Use your card to make international transactions</Text>
            </View>
            <Switch
              value={internationalTransactions}
              onValueChange={handleInternational}
              trackColor={{ false: "#ddd", true: colors.primary }}
              thumbColor={internationalTransactions ? "#fff" : "#fff"}
            />
          </View>
          <TouchableOpacity style={styles.learnMore}>
            <Text style={styles.learnMoreText}>Learn more about card toggles</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.missingSection}>
          <Text style={styles.missingTitle}>Missing some features?</Text>
          <Text style={styles.missingDescription}>
            Search for Capitec in your phone&apos;s settings and switch on location permission for our app.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionItem} onPress={handleTapToPay}>
            <Ionicons name="hand-left-outline" size={22} color={colors.navy} />
            <Text style={styles.actionText}>Tap to pay</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleReplaceStop}>
            <View style={styles.actionLeft}>
              <Ionicons name="card-outline" size={22} color={colors.navy} />
              <Text style={styles.actionText}>Replace or Stop card</Text>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleUpdateLimits}>
            <Ionicons name="refresh-outline" size={22} color={colors.navy} />
            <Text style={styles.actionText}>Update permanent limits</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleTempLimits}>
            <Ionicons name="time-outline" size={22} color={colors.navy} />
            <Text style={styles.actionText}>Set temporary limits</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal
        animationType="fade"
        transparent
        visible={warningModalVisible}
        onRequestClose={() => setWarningModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setWarningModalVisible(false)}
        >
          <View style={styles.warningModalContent}>
            <Ionicons name="shield-checkmark" size={56} color="#FF6B6B" />
            <Text style={styles.warningTitle}>PROTECT YOUR CARD DETAILS</Text>
            <Text style={styles.warningDescription}>
              Don&apos;t respond to anyone requesting your card details.\n\nWe will never ask for your PIN or CVV.
            </Text>
            <TouchableOpacity style={styles.warningButton} onPress={handleWarningConfirm}>
              <LinearGradient colors={["#6C63FF", "#5B8DEF"]} style={styles.warningGradient}>
                <Text style={styles.warningButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={pinModalVisible}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPinModalVisible(false)}
        >
          <View style={styles.pinModalContent}>
            <Text style={styles.pinTitle}>Enter your PIN</Text>
            <Text style={styles.pinSubtitle}>Confirm to view card details</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="• • • • •"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={5}
              value={pin}
              onChangeText={setPin}
              autoFocus
            />
            <View style={styles.pinButtonRow}>
              <TouchableOpacity
                style={[styles.pinButton, styles.pinCancel]}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={styles.pinCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pinButton} onPress={handlePinConfirm}>
                <LinearGradient colors={["#6C63FF", "#5B8DEF"]} style={styles.pinGradient}>
                  <Text style={styles.pinConfirmText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={freezeModalVisible}
        onRequestClose={() => setFreezeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFreezeModalVisible(false)}
        >
          <View style={styles.confirmModalContent}>
            <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
            <Text style={styles.confirmTitle}>Freeze your card?</Text>
            <Text style={styles.confirmDescription}>
              You are about to freeze your card. No payments, subscriptions or withdrawals can be made while it's frozen.
            </Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancel]}
                onPress={() => setFreezeModalVisible(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmFreeze]}
                onPress={confirmFreeze}
              >
                <Text style={styles.confirmFreezeText}>Freeze Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Styles – adapted from your original, with project colours
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 40, paddingTop: 16 },
  cardWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  cardContainer: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  flipCard: {
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    position: "absolute",
  },
  backCard: { transform: [{ rotateY: "180deg" }] },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: "100%",
    height: "100%",
  },
  cardBack: {},
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardType: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  cardNumber: { fontSize: 18, fontWeight: "600", color: "#fff", letterSpacing: 2, marginBottom: 16 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBank: { fontSize: 14, fontWeight: "600", color: "#fff", opacity: 0.9 },
  cardHolder: { fontSize: 12, fontWeight: "500", color: "#fff", opacity: 0.8, marginTop: 2 },
  accountInfo: { alignItems: "flex-end" },
  accountNumber: { fontSize: 13, fontWeight: "600", color: "#fff", opacity: 0.9 },
  accountType: { fontSize: 11, fontWeight: "500", color: "#fff", opacity: 0.7, marginTop: 2 },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 12,
  },
  detailsButtonText: { fontSize: 12, fontWeight: "600", color: "#fff", marginRight: 4 },
  backContent: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  flipBackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  flipBackText: { fontSize: 13, fontWeight: "600", color: "#fff", marginLeft: 6 },
  toggleSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  toggleTextContainer: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 15, fontWeight: "600", color: colors.navy },
  toggleDescription: { fontSize: 12, color: "#888", marginTop: 2 },
  learnMore: { marginTop: 8, alignItems: "center" },
  learnMoreText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  missingSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  missingTitle: { fontSize: 15, fontWeight: "700", color: colors.navy, marginBottom: 4 },
  missingDescription: { fontSize: 13, color: "#888", lineHeight: 18 },
  actionSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  actionText: { fontSize: 14, fontWeight: "500", color: colors.navy, marginLeft: 12, flex: 1 },
  newBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  newBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  warningModalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    width: "85%",
  },
  warningTitle: { fontSize: 18, fontWeight: "800", color: "#FF6B6B", marginTop: 12, textAlign: "center" },
  warningDescription: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8, lineHeight: 20 },
  warningButton: { borderRadius: 30, overflow: "hidden", marginTop: 20, width: "100%" },
  warningGradient: { paddingVertical: 14, alignItems: "center" },
  warningButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  pinModalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    width: "80%",
  },
  pinTitle: { fontSize: 20, fontWeight: "700", color: colors.navy, marginBottom: 4 },
  pinSubtitle: { fontSize: 13, color: "#888", marginBottom: 24 },
  pinInput: {
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: 16,
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    width: "80%",
    color: colors.navy,
  },
  pinButtonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 28, gap: 12 },
  pinButton: { flex: 1, borderRadius: 30, overflow: "hidden" },
  pinCancel: { backgroundColor: "#f0f0f5", justifyContent: "center", alignItems: "center", paddingVertical: 14 },
  pinCancelText: { fontSize: 16, fontWeight: "600", color: "#888" },
  pinGradient: { paddingVertical: 14, alignItems: "center" },
  pinConfirmText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  confirmModalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    width: "85%",
  },
  confirmTitle: { fontSize: 20, fontWeight: "700", color: colors.navy, marginTop: 12 },
  confirmDescription: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8, lineHeight: 20 },
  confirmButtonRow: { flexDirection: "row", marginTop: 24, gap: 12, width: "100%" },
  confirmButton: { flex: 1, borderRadius: 30, paddingVertical: 14, alignItems: "center" },
  confirmCancel: { backgroundColor: "#f0f0f5" },
  confirmCancelText: { fontSize: 16, fontWeight: "600", color: "#888" },
  confirmFreeze: { backgroundColor: "#FF6B6B" },
  confirmFreezeText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 100 },
});