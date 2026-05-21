import { useEffect, useState } from "react";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { getActiveDecoyProfile } from "@/services/secureEscapeService";

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);

  useEffect(() => {
    getProfileMe().then(setProfile).catch(console.error);
  }, []);
  const menuItems = [
    { title: "My information", subtitle: "view and update information" },
    {
      title: "My app settings",
      subtitle: "update personal and security settings",
    },
    {
      title: "Personalise my app",
      subtitle: "Display what matters most to you",
    },
    { title: "My Security center", subtitle: "view and update information" },
    {
      title: "Secure Escape",
      subtitle: "Set Duress Pin",
      isSecureEscape: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={70} color={colors.primary} />
        </View>
        <Text style={styles.name}>Hello {profile?.fullName ?? "..."} !</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuRow}
            onPress={async () => {
              if (item.isSecureEscape) {
                const profile = await getActiveDecoyProfile();
                if (profile) {
                  router.push("/secure-escape/manage-secure-escape");
                } else {
                  router.push("/secure-escape/intro");
                }
              }
              // other actions later
            }}
          >
            <View>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: {
    paddingBottom: 40, // space at bottom
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80, // increased from 52 → 48 (more natural)
    paddingHorizontal: 24,
    gap: 12,
  },
  backArrow: { fontSize: 18, color: "#888" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.navy },
  profile: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 8, // slight separation from header
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EFFF", // soft purple background for the icon
  },
  name: {
    marginTop: 12, // increased from 10
    fontSize: 16, // increased from 15
    fontWeight: "700",
    color: colors.primary,
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLine,
  },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.navy },
  rowSubtitle: { fontSize: 12, color: colors.textSub },
  chevron: { fontSize: 16, color: "#bbb" },
});
