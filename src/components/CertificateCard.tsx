import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radii } from '../theme';

export interface CertificateCardProps {
  icon: string;
  headline: string;
  subtitle: string;
  name: string;
  date: string;
}

/**
 * The certificate visual shown in CertificateModal as a preview before
 * sharing — a text summary of it is what actually gets shared (see
 * CertificateModal), so this is presentational only, no capture ref needed.
 */
export default function CertificateCard({ icon, headline, subtitle, name, date }: CertificateCardProps) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#14136E', '#3D52C9', '#6E4D9C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.brand}>JOTMINDS</Text>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.divider} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{date}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  card: {
    borderRadius: radii.xl, paddingVertical: 40, paddingHorizontal: 28, alignItems: 'center',
  },
  brand: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  headline: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  divider: { width: '60%', height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 24 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  date: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
});
