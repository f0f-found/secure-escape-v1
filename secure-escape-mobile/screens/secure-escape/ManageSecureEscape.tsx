import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { getEmergencyContacts } from "@/services/emergencyContactService";
import { getActiveDecoyProfile } from "@/services/secureEscapeService";
import { EmergencyContactResponse } from "@/types/emergencyContact";
import { DecoyProfileResponse } from "@/types/secureEscape";
import VerifyPinModal from "@/components/VerifyPinModal";

export default function ManageSecureEscape() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContactResponse[]>([]);
  const [profile, setProfile] = useState<DecoyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(true);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [contactData, profileData] = await Promise.all([
        getEmergencyContacts(),
        getActiveDecoyProfile(),
      ]);
      setContacts(contactData);
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load Secure Escape details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentityVerified = async () => {
    setVerifyVisible(false);
    setIdentityVerified(true);
    await loadDetails();
  };

  return (
    <>
      <VerifyPinModal
        visible={verifyVisible}
        onCancel={() => router.back()}
        onVerified={handleIdentityVerified}
        title="Confirm your identity"
        subtitle="Enter your normal banking PIN to view Secure Escape details"
      />
      {identityVerified && <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Escape</Text>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <View style={styles.activeBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.activeText}>Secure Escape is Active</Text>
        </View>

        <Text style={styles.mainTitle}>Manage Secure Escape</Text>
        <Text style={styles.sub}>
          Your Secure Escape protection is active. Review your safety details
          below and keep them private.
        </Text>

        <View style={styles.protectionCard}>
          <View style={styles.protectionIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#0F766E" />
          </View>
          <View style={styles.protectionCopy}>
            <Text style={styles.cardEyebrow}>Protection amount</Text>
            <Text style={styles.protectionAmount}>
              {profile ? `R ${profile.emergencyBudget.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}` : "Unavailable"}
            </Text>
            <Text style={styles.cardHint}>
              Maximum amount available under duress
            </Text>
          </View>
        </View>

        <View style={styles.pinStatusCard}>
          <Ionicons name="key-outline" size={21} color={colors.primary} />
          <View style={styles.pinStatusCopy}>
            <Text style={styles.pinStatusTitle}>Duress PIN</Text>
            <Text style={styles.pinStatusValue}>Set  •  •  •  •</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={colors.greyLine} />
            <Text style={styles.emptyText}>
              No emergency contacts added yet
            </Text>
            <Text style={styles.emptySubText}>
              Emergency contacts will be silently notified if you trigger duress
              mode
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.fullName}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                  {contact.relationship ? (
                    <Text style={styles.contactRelationship}>
                      {contact.relationship}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        )}

        <View style={styles.branchNotice}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.branchNoticeText}>
            To change your protection amount, Duress PIN, or emergency contact,
            please contact your nearest branch.
          </Text>
        </View>
      </View>
      </ScrollView>}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  gradientHeader: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  activeText: { fontSize: 13, fontWeight: "600", color: "#10B981" },
  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 20,
    marginBottom: 28,
  },
  protectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  protectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  protectionCopy: { flex: 1 },
  cardEyebrow: {
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  protectionAmount: {
    fontSize: 24,
    color: colors.navy,
    fontWeight: "800",
    marginTop: 2,
  },
  cardHint: { fontSize: 12, color: colors.textSub, marginTop: 3 },
  pinStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF9FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  pinStatusCopy: { flex: 1, marginLeft: 12 },
  pinStatusTitle: { color: colors.navy, fontSize: 15, fontWeight: "700" },
  pinStatusValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  emptySubText: {
    fontSize: 12,
    color: colors.textSub,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 18,
  },
  contactCard: {
    borderWidth: 1,
    borderColor: colors.greyLine,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactInfo: { flex: 1 },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  contactName: { fontSize: 15, fontWeight: "700", color: colors.navy },
  primaryBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryText: { fontSize: 11, fontWeight: "600", color: colors.primary },
  contactPhone: { fontSize: 13, color: colors.textSub },
  contactRelationship: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 2,
  },
  branchNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  branchNoticeText: {
    flex: 1,
    color: colors.textSub,
    fontSize: 13,
    lineHeight: 19,
  },
});
