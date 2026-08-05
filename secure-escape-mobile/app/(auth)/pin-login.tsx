import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '@/utils/theme';
import { useRouter } from 'expo-router';

export default function PinLogin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleSubmit = () => {
    if (pin.length === 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Please enter a 6-digit PIN');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <View style={{ width: 24 }} />
        <View style={styles.topPill} />
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Global<Text style={styles.logoO}>O</Text>ne</Text>
      </View>
      <View style={styles.pinArea}>
        <View style={styles.pinLabelRow}>
          <Text style={styles.pinLabel}>Enter app PIN</Text>
          <TouchableOpacity><Text style={styles.forgotPin}>Forgot PIN</Text></TouchableOpacity>
        </View>
        <TextInput style={styles.pinInput} secureTextEntry maxLength={6} keyboardType="numeric" value={pin} onChangeText={setPin} placeholder="••••••" placeholderTextColor="#ccc" />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={['#7C6EF7', '#4A6CF7']} style={styles.gradientButton}>
            <Text style={styles.submitText}>Submit</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.biometricsSection}>
        <View style={styles.biometricsRow}>
          <View style={styles.biometricsText}>
            <Text style={styles.biometricsTitle}>Biometrics</Text>
            <Text style={styles.biometricsSubtitle}>Sign in and authenticate with fingerprint or facial recognition</Text>
          </View>
          <Switch value={biometricsEnabled} onValueChange={setBiometricsEnabled} trackColor={{ false: colors.greyLine, true: colors.primary }} thumbColor="#fff" />
        </View>
        <TouchableOpacity style={styles.dontShowRow} onPress={() => setDontShowAgain(!dontShowAgain)} activeOpacity={0.7}>
          <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
            {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.dontShowText}>Dont show me this again</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, marginBottom: 20 },
  topPill: { width: 130, height: 5, backgroundColor: '#ccc', borderRadius: 10 },
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  logoText: { fontSize: 42, fontWeight: '800', color: colors.navy, letterSpacing: -1 },
  logoO: { borderWidth: 4, borderColor: '#4A6CF7', borderRadius: 38, width: 42, height: 42, textAlign: 'center', lineHeight: 36, marginHorizontal: 2, fontSize: 36, fontWeight: '800', color: colors.navy },
  pinArea: { paddingHorizontal: 24, marginBottom: 30 },
  pinLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pinLabel: { fontSize: 14, color: colors.textSub },
  forgotPin: { fontSize: 13, color: colors.primary, textDecorationLine: 'underline' },
  pinInput: { borderWidth: 1.5, borderColor: colors.greyLine, borderRadius: 16, padding: 14, fontSize: 20, letterSpacing: 8, textAlign: 'center', backgroundColor: '#FAFAFA' },
  submitButton: { marginTop: 28, borderRadius: 50, overflow: 'hidden' },
  gradientButton: { paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  biometricsSection: { marginHorizontal: 20, backgroundColor: '#F8F9FC', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.greyLine, marginTop: 10 },
  biometricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  biometricsText: { flex: 1, marginRight: 12 },
  biometricsTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  biometricsSubtitle: { fontSize: 13, color: colors.textSub, lineHeight: 18 },
  dontShowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: colors.greyLine, borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  dontShowText: { fontSize: 13, color: colors.textSub },
  bottomSpacer: { height: 30 },
});