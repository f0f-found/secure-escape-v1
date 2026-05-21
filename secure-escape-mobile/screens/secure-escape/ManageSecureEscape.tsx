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
import {
  getEmergencyContacts,
  deleteEmergencyContact,
} from "@/services/emergencyContactService";
import { EmergencyContactResponse } from "@/types/emergencyContact";

export default function ManageSecureEscape() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContactResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmergencyContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <ScrollView
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
          To update your emergency budget or duress PIN, please visit your
          nearest branch or call the bank directly.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            onPress={() =>
              router.push("/secure-escape/emergency-contact?from=manage")
            }
          >
            <Text style={styles.addLink}>+ Add Contact</Text>
          </TouchableOpacity>
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
                <TouchableOpacity
                  onPress={() => handleDelete(contact.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger ?? "#EF4444"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  addLink: { fontSize: 14, color: colors.primary, fontWeight: "600" },
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
  deleteButton: { padding: 4 },
});
