import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

export default function DashboardScreen() {
  const router = useRouter();

  const accountCards = [
    { name: 'Main Account', balance: 28840, icon: 'wallet', gradient: ['#9F8FEF', '#7C6EF7'] as [string, string], iconBg: '#9F8FEF20' },
    { name: 'Savings Plans', balance: 3789, icon: 'trending-up', gradient: ['#93C5FD', '#60A5FA'] as [string, string], iconBg: '#60A5FA20' },
  ];

  const favourites = [
    { label: 'Pay Beneficiary', icon: 'people', bg: '#EEEEFF', isPayBeneficiary: true },
    { label: 'Transfer', icon: 'swap-horizontal', bg: '#FFF0F5' },
    { label: 'Send Cash', icon: 'cash', bg: '#E6FAF8' },
    { label: 'Buy Prepaid', icon: 'phone-portrait', bg: '#FFFBEB' },
    { label: 'Pay the bill', icon: 'document-text', bg: '#F0FDF4' },
    { label: 'Credit card', icon: 'card', bg: '#FFF5F5' },
    { label: 'Transaction report', icon: 'stats-chart', bg: '#EEEEFF' },
  ];

  const handleTilePress = (item: any) => {
    if (item.isPayBeneficiary) {
      router.push('/(tabs)/beneficiary/list');
    } else {
      Alert.alert('Coming Soon', `The "${item.label}" feature will be available soon.`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>My Dashboard</Text>
        <Text style={styles.greeting}>Good afternoon, Naomie</Text>
      </View>
      <View style={styles.cardsRow}>
        {accountCards.map((card, idx) => (
          <TouchableOpacity key={idx} activeOpacity={0.9} style={styles.cardWrapper}>
            <LinearGradient colors={card.gradient} style={[styles.accountCard, cardShadow]}>
              <View style={[styles.iconCircle, { backgroundColor: card.iconBg }]}>
                <Ionicons name={card.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.accName}>{card.name}</Text>
              <Text style={styles.accBalance}>R {card.balance.toLocaleString()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.favouritesSection}>
        <View style={styles.favouritesHeader}>
          <Text style={styles.favTitle}>Favourites</Text>
          <TouchableOpacity><Text style={styles.editLink}>edit ›</Text></TouchableOpacity>
        </View>
        <View style={styles.favGrid}>
          {favourites.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.favTile, cardShadow]} activeOpacity={0.7} onPress={() => handleTilePress(item)}>
              <View style={[styles.favIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.favLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.greyBg || '#F8F9FA' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.navy || '#1A202C' },
  greeting: { fontSize: 14, color: colors.textSub || '#718096', marginTop: 6 },
  cardsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 16, marginTop: 8, marginBottom: 28 },
  cardWrapper: { flex: 1 },
  accountCard: { borderRadius: 28, padding: 18 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  accName: { fontSize: 14, fontWeight: '600', color: '#fff', opacity: 0.9 },
  accBalance: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 6 },
  favouritesSection: { paddingHorizontal: 16, marginTop: 4 },
  favouritesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  favTitle: { fontSize: 18, fontWeight: '800', color: colors.navy || '#1A202C' },
  editLink: { fontSize: 14, fontWeight: '600', color: colors.primary || '#3B82F6', opacity: 0.75 },
  favGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  favTile: { width: (width - 48) / 3, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  favIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  favLabel: { fontSize: 11, fontWeight: '600', color: '#1A202C', textAlign: 'center', paddingHorizontal: 4 },
});