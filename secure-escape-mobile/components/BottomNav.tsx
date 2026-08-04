import { useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '@/utils/theme';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', path: '/(tabs)' },
    { name: 'Cards', path: '/(tabs)/cards' },
    { name: 'Transact', path: '/(tabs)/transact' },
    { name: 'Messages', path: '/(tabs)/messages' },
    { name: 'Settings', path: '/(tabs)/settings' },
  ] as const;

  const isActive = (path: string) => {
    if (path === '/(tabs)') return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    return pathname === path;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.path}
          style={styles.tab}
          onPress={() => router.push(tab.path)}
        >
          <Text style={[styles.label, isActive(tab.path) && styles.activeLabel]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSub || '#718096',
  },
  activeLabel: {
    color: colors.primary || '#3B82F6',
    fontWeight: '700',
  },
});