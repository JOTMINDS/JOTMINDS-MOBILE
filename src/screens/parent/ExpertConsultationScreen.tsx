import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  rating: number;
  reviewCount: number;
  availability: string;
  price: string;
  avatar: string;
  gradient: [string, string];
}

export default function ExpertConsultationScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const experts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      specialty: 'Child Cognitive Development',
      credentials: 'PhD, Licensed Psychologist',
      rating: 4.9,
      reviewCount: 127,
      availability: 'Next available: Tomorrow',
      price: '$120/hour',
      avatar: '👩‍⚕️',
      gradient: ['#6E4D9C', '#5A3E82'],
    },
    {
      id: '2',
      name: 'Dr. James Chen',
      specialty: 'Learning Disabilities & ADHD',
      credentials: 'MD, Developmental Pediatrician',
      rating: 5.0,
      reviewCount: 89,
      availability: 'Next available: This week',
      price: '$150/hour',
      avatar: '👨‍⚕️',
      gradient: ['#3D52C9', '#2E3FA8'],
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Emotional Intelligence & Social Skills',
      credentials: 'PhD, Child Psychologist',
      rating: 4.8,
      reviewCount: 156,
      availability: 'Next available: Next week',
      price: '$110/hour',
      avatar: '👩‍🏫',
      gradient: ['#EC4899', '#DB2777'],
    },
    {
      id: '4',
      name: 'Dr. Michael Thompson',
      specialty: 'Executive Function Coaching',
      credentials: 'EdD, Cognitive Coach',
      rating: 4.7,
      reviewCount: 94,
      availability: 'Next available: Tomorrow',
      price: '$100/hour',
      avatar: '👨‍🎓',
      gradient: ['#10B981', '#059669'],
    },
  ];

  const availableDates = [
    'Mon, May 19',
    'Tue, May 20',
    'Wed, May 21',
    'Thu, May 22',
    'Fri, May 23',
  ];

  const availableTimes = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
  ];

  const handleBooking = () => {
    console.log('Booking consultation:', {
      expertId: selectedExpert,
      date: selectedDate,
      time: selectedTime,
      notes,
    });
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Expert Consultation</Text>
 <Text style={styles.name}>Connect with Specialists</Text>
          <Text style={styles.tagline}>
            Get personalized guidance for your child's needs
          </Text>
        </View>

        <LinearGradient
          colors={['#EC4899', '#DB2777', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <AppIcon name="📞" size={22} style={styles.infoIcon} />
          <Text style={styles.infoTitle}>How it Works</Text>
          <View style={styles.infoSteps}>
            <Text style={styles.infoStep}>1. Choose an expert specialist</Text>
            <Text style={styles.infoStep}>2. Select date and time</Text>
            <Text style={styles.infoStep}>3. Join video or phone call</Text>
            <Text style={styles.infoStep}>4. Receive personalized plan</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select an Expert</Text>
          {experts.map((expert) => {
            const isSelected = selectedExpert === expert.id;
            return (
              <TouchableOpacity
                key={expert.id}
                onPress={() => setSelectedExpert(expert.id)}
              >
                <GlassCard
                  padding={16}
                  style={[
                    styles.expertCard,
                    isSelected && { borderColor: colors.coral, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.expertRow}>
                    <LinearGradient
                      colors={expert.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.expertAvatar}
                    >
                      <Text style={styles.expertAvatarIcon}>
                        {expert.avatar}
                      </Text>
                    </LinearGradient>
                    <View style={styles.expertContent}>
                      <Text style={styles.expertName}>{expert.name}</Text>
                      <Text style={styles.expertSpecialty}>
                        {expert.specialty}
                      </Text>
                      <Text style={styles.expertCredentials}>
                        {expert.credentials}
                      </Text>
                      <View style={styles.expertMetaRow}>
                        <View style={styles.ratingRow}>
                          <AppIcon name="⭐" size={18} style={styles.ratingStar} />
                          <Text style={styles.ratingText}>
                            {expert.rating} ({expert.reviewCount})
                          </Text>
                        </View>
                        <Text style={styles.expertPrice}>{expert.price}</Text>
                      </View>
                      <Text style={styles.expertAvailability}>
                        {expert.availability}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <AppIcon name="✓" size={18} style={styles.selectedText} />
                      </View>
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedExpert && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}
              >
                {availableDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    onPress={() => setSelectedDate(date)}
                  >
                    <View
                      style={[
                        styles.dateChip,
                        selectedDate === date && styles.dateChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          selectedDate === date && styles.dateTextSelected,
                        ]}
                      >
                        {date}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedDate && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                <View style={styles.timeGrid}>
                  {availableTimes.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      style={styles.timeSlot}
                    >
                      <View
                        style={[
                          styles.timeChip,
                          selectedTime === time && styles.timeChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            selectedTime === time && styles.timeTextSelected,
                          ]}
                        >
                          {time}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedTime && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Additional Notes (Optional)
                </Text>
                <GlassCard padding={0}>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="What would you like to discuss with the expert?"
                    placeholderTextColor={colors.textSubtle}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </GlassCard>
              </View>
            )}

            {selectedTime && (
              <View style={styles.section}>
                <GlassCard padding={20} style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Booking Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expert:</Text>
                    <Text style={styles.summaryValue}>
                      {experts.find((e) => e.id === selectedExpert)?.name}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>{selectedDate}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time:</Text>
                    <Text style={styles.summaryValue}>{selectedTime}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Duration:</Text>
                    <Text style={styles.summaryValue}>1 hour</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>Total:</Text>
                    <Text style={styles.summaryTotalValue}>
                      {experts.find((e) => e.id === selectedExpert)?.price}
                    </Text>
                  </View>
                </GlassCard>

                <GradientButton
                  label="Confirm Booking"
                  onPress={handleBooking}
                  icon="→"
                />
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Our Experts?</Text>
          <GlassCard padding={20}>
            <View style={styles.benefitRow}>
              <AppIcon name="✓" size={22} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                All experts are licensed professionals
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <AppIcon name="✓" size={22} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Personalized action plans included
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <AppIcon name="✓" size={22} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Follow-up support via messaging
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <AppIcon name="✓" size={22} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                100% satisfaction guarantee
              </Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSubtle,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 6,
  },
  infoCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    ...shadow.glow,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  infoSteps: {
    alignSelf: 'stretch',
  },
  infoStep: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: spacing.md,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.4,
  },
  expertCard: {
    marginBottom: spacing.md,
  },
  expertRow: {
    flexDirection: 'row',
  },
  expertAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  expertAvatarIcon: {
    fontSize: 28,
  },
  expertContent: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  expertSpecialty: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple,
    marginBottom: 2,
  },
  expertCredentials: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  expertMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  expertPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  expertAvailability: {
    fontSize: 12,
    color: colors.cyan,
    fontWeight: '600',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dateScroll: {
    marginBottom: spacing.md,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateChipSelected: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeSlot: {
    width: '33.333%',
    padding: 6,
  },
  timeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeChipSelected: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    padding: 16,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 16,
    color: colors.success,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
