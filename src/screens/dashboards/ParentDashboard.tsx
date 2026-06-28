import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import {
  getLinkedChildren,
  createAccessRequest,
  getPendingAccessRequests,
  approveAccessRequest,
  denyAccessRequest,
} from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AppIcon from '../../components/AppIcon';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function ParentDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [showAddChild, setShowAddChild] = useState(false);

  const fetchData = async () => {
    try {
      const [c, r] = await Promise.all([getLinkedChildren(), getPendingAccessRequests()]);
      setChildren(c.children || []);
      setRequests(r.requests || []);
    } catch (e) {
      console.error('[ParentDashboard]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLinkChild = async () => {
    if (!childEmail) return Alert.alert('Error', 'Please enter child email');
    try {
      await createAccessRequest(childEmail);
      Alert.alert('Success', 'Access request sent to child');
      setChildEmail('');
      setShowAddChild(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send request');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAccessRequest(id);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await denyAccessRequest(id);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.name}>{user?.name || 'Parent'}</Text>
          <Text style={styles.tagline}>Support your child's cognitive growth</Text>
        </View>

        <LinearGradient
          colors={['#EC4899', '#DB2777', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.snapshotCard}
        >
          <Text style={styles.snapshotLabel}>FAMILY SNAPSHOT</Text>
          <View style={styles.snapshotStatsRow}>
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{children.length}</Text>
              <Text style={styles.snapshotStatLabel}>Linked</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{requests.length}</Text>
              <Text style={styles.snapshotStatLabel}>Pending</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>
                {children.reduce((s, c) => s + (c.assessmentsCompleted?.length || 0), 0)}
              </Text>
              <Text style={styles.snapshotStatLabel}>Insights</Text>
            </View>
          </View>
        </LinearGradient>

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {requests.map((req, i) => (
              <GlassCard key={i} padding={16} style={styles.spacedCard}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Access request</Text>
                    <Text style={styles.cardSubtle}>{req.childEmail}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleApprove(req.id)} style={[styles.iconBtn, { backgroundColor: colors.success }]}>
                      <AppIcon name="✓" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeny(req.id)} style={[styles.iconBtn, { backgroundColor: '#EF4444' }]}>
                      <AppIcon name="✕" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <TouchableOpacity onPress={() => setShowAddChild(!showAddChild)}>
              <Text style={styles.addLink}>{showAddChild ? 'Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {showAddChild && (
            <GlassCard padding={16} style={styles.spacedCard}>
              <TextInput
                style={styles.input}
                placeholder="Child's email address"
                placeholderTextColor={colors.textSubtle}
                value={childEmail}
                onChangeText={setChildEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <GradientButton label="Send Request" onPress={handleLinkChild} icon="" />
            </GlassCard>
          )}

          {children.length === 0 ? (
            <GlassCard padding={32}>
              <View style={styles.empty}>
                <AppIcon name="👶" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
                <Text style={styles.cardTitle}>No linked children yet</Text>
                <Text style={styles.cardSubtle}>Add your child's email to request access</Text>
              </View>
            </GlassCard>
          ) : (
            children.map((child, i) => (
              <GlassCard key={i} style={styles.spacedCard} padding={16}>
                <View style={styles.row}>
                  <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.avatar} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.avatarText}>{(child.name || '?')[0].toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.cardTitle}>{child.name}</Text>
                    <Text style={styles.cardSubtle}>{child.email}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{child.assessmentsCompleted?.length || 0}</Text>
                    <Text style={styles.statBadgeLabel}>tests</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent Resources</Text>
          <GlassCard
            padding={16}
            style={styles.spacedCard}
            onPress={() => navigation.navigate('CoachingPathways')}
          >
            <View style={styles.row}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.resourceIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppIcon name="🎓" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.cardTitle}>Coaching Pathways</Text>
                <Text style={styles.cardSubtle}>
                  Expert-guided programs to support your child
                </Text>
              </View>
              <Text style={styles.resourceArrow}>→</Text>
            </View>
          </GlassCard>

          <GlassCard
            padding={16}
            style={styles.spacedCard}
            onPress={() => navigation.navigate('ExpertConsultation')}
          >
            <View style={styles.row}>
              <LinearGradient
                colors={['#6E4D9C', '#5A3E82']}
                style={styles.resourceIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppIcon name="⚕️" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.cardTitle}>Expert Consultation</Text>
                <Text style={styles.cardSubtle}>
                  Book 1-on-1 sessions with specialists
                </Text>
              </View>
              <Text style={styles.resourceArrow}>→</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.xxl },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  tagline: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  snapshotCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  snapshotLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginBottom: spacing.lg },
  snapshotStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  snapshotStat: { flex: 1, alignItems: 'center' },
  snapshotStatValue: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  snapshotStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  snapshotDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  addLink: { color: colors.purple, fontSize: 15, fontWeight: '700' },
  spacedCard: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  iconRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  input: {
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radii.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text,
    backgroundColor: colors.glassMedium, marginBottom: spacing.md,
  },
  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  statBadge: { alignItems: 'center', backgroundColor: colors.glassMedium, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statBadgeText: { color: colors.cyan, fontWeight: '800', fontSize: 16 },
  statBadgeLabel: { color: colors.textMuted, fontSize: 10 },
  resourceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resourceIconText: { fontSize: 20 },
  resourceArrow: { fontSize: 20, color: colors.purple, fontWeight: '700' },
});
