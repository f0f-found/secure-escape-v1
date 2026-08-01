import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/theme';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const menuItems = [
    { title: 'My information', subtitle: 'view and update information' },
    { title: 'My app settings', subtitle: 'update personal and security settings' },
    { title: 'Personalise my app', subtitle: 'Display what matters most to you' },
    { title: 'My Security center', subtitle: 'view and update information' },
    { title: 'Secure Escape', subtitle: 'Set Duress Pin', isSecureEscape: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={70} color={colors.primary} />
        </View>
        <Text style={styles.name}>Hello Naomie...</Text>
      </View>
      <View style={styles.menu}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuRow} onPress={() => {
            if (item.isSecureEscape) router.push('/secure-escape/intro');
          }}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingTop: 80, paddingHorizontal: 24, gap: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.navy || '#1A202C' },
  profile: { alignItems: 'center', paddingVertical: 24, marginTop: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EFFF' },
  name: { marginTop: 12, fontSize: 16, fontWeight: '700', color: colors.primary },
  menu: { flex: 1, paddingHorizontal: 20, marginTop: 8 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.navy || '#1A202C' },
  rowSubtitle: { fontSize: 12, color: colors.textSub || '#718096' },
  chevron: { fontSize: 16, color: '#bbb' },
});