import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";

export default function ProfileDetails() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProfileMe();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
  }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.detailTextGroup}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "—"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Details</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person-circle" size={72} color={colors.primary} />
            </View>
            <Text style={styles.name}>
              {profile?.fullName ?? (loading ? "Loading..." : "—")}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    profile?.status === "Active" ? "#E6F7EE" : "#FDECEC",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: profile?.status === "Active" ? "#1FA971" : "#E5484D",
                  },
                ]}
              >
                {profile?.status ?? "—"}
              </Text>
            </View>
          </View>

          {!!error && (
            <TouchableOpacity onPress={loadProfile}>
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <DetailRow
              icon="mail-outline"
              label="Email"
              value={profile?.email}
            />
            <DetailRow
              icon="call-outline"
              label="Phone Number"
              value={profile?.phoneNumber}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <DetailRow
              icon="business-outline"
              label="Bank Customer ID"
              value={profile?.bankCustomerId}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    marginTop: -20,
  },
  avatarSection: { alignItems: "center", paddingVertical: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EFFF",
  },
  name: { marginTop: 12, fontSize: 18, fontWeight: "800", color: colors.navy },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSub,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailTextGroup: { flex: 1 },
  detailLabel: { fontSize: 12, color: "#888" },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginTop: 2,
  },
  errorText: {
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
});
