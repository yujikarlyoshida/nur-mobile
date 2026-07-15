import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { setOnboardingComplete, updateUserProfile, setDisclaimerAccepted } from '../services/storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const LANGUAGES = [
  { code: 'en' as const, label: 'English', native: 'English' },
  { code: 'ar' as const, label: 'Arabic', native: 'العربية' },
  { code: 'ur' as const, label: 'Urdu', native: 'اردو' },
  { code: 'ms' as const, label: 'Malay', native: 'Bahasa Melayu' },
];

const TRANSLATIONS = [
  { id: 'sahih_international', label: 'Sahih International', description: 'Clear modern English' },
  { id: 'pickthall', label: 'Pickthall', description: 'Classic English' },
  { id: 'yusuf_ali', label: 'Yusuf Ali', description: 'Traditional with commentary' },
  { id: 'clear_quran', label: 'The Clear Quran', description: 'Contemporary language (Dr. Khattab)' },
];

// Steps: 0 Welcome · 1 How It Works · 2 About Your Location · 3 Preferences · 4 A Note of Care (liability, required)
const TOTAL_STEPS = 5;
const LIABILITY_STEP = 4;

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | 'ur' | 'ms'>('en');
  const [selectedTranslation, setSelectedTranslation] = useState('sahih_international');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const goToStep = (nextStep: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    setStep(nextStep);
  };

  // "Skip" jumps straight to the required liability/terms step rather than
  // completing onboarding outright — the one step in this flow that isn't
  // skippable, since it's the disclaimer users are acknowledging.
  const handleSkip = () => goToStep(LIABILITY_STEP);

  const handleGetStarted = async () => {
    await updateUserProfile({
      language: selectedLanguage,
      translation: selectedTranslation,
    });
    await setDisclaimerAccepted();
    await setOnboardingComplete();
    navigation.replace('MainTabs');
  };

  const renderDots = () => (
    <View style={styles.dots}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === step ? Colors.primary : Colors.border },
            i === step && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Skip button — hidden on the required liability step */}
        {step < LIABILITY_STEP && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides — only the active step is rendered */}
        <ScrollView
          ref={scrollRef}
          style={styles.slidesContainer}
          contentContainerStyle={styles.slide}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <>
              <View style={styles.logoContainer}>
                <Text style={styles.logoAr}>نور</Text>
                <Text style={styles.logoEn}>NUR</Text>
              </View>
              <Text style={styles.tagline}>Quranic Wellbeing</Text>
              <Text style={styles.description}>
                Find peace, clarity, and spiritual nourishment through the timeless words of the Quran — guided by your emotions.
              </Text>
              <View style={styles.features}>
                {[
                  { icon: 'heart-outline', text: 'Share how you feel' },
                  { icon: 'book-outline', text: 'Receive relevant verses' },
                  { icon: 'musical-notes-outline', text: 'Listen to recitations' },
                  { icon: 'journal-outline', text: 'Track your spiritual journey' },
                ].map(({ icon, text }) => (
                  <View key={text} style={styles.featureRow}>
                    <View style={styles.featureIcon}>
                      <Ionicons name={icon as any} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>How Nur Works</Text>
              <Text style={styles.stepSubtitle}>A quick walkthrough before you begin</Text>
              <View style={styles.tutorialList}>
                {[
                  {
                    number: '1',
                    icon: 'happy-outline',
                    title: 'Check In',
                    text: "Tap a mood, write freely, or use voice to describe how you're feeling right now — whatever's easiest.",
                  },
                  {
                    number: '2',
                    icon: 'book-outline',
                    title: 'Receive Verses',
                    text: 'Nur matches your emotional state to relevant Quran verses, each with a short personalized reflection.',
                  },
                  {
                    number: '3',
                    icon: 'compass-outline',
                    title: 'Explore & Reflect',
                    text: 'Save verses you connect with, revisit past check-ins in your Journal, and — if you choose to share your location — see nearby things to do that fit the moment.',
                  },
                ].map((item) => (
                  <View key={item.number} style={styles.tutorialCard}>
                    <View style={styles.tutorialNumber}>
                      <Text style={styles.tutorialNumberText}>{item.number}</Text>
                    </View>
                    <View style={styles.tutorialContent}>
                      <View style={styles.tutorialTitleRow}>
                        <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
                        <Text style={styles.tutorialTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.tutorialText}>{item.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.disclaimerIcon}>
                <Ionicons name="location-outline" size={44} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>About Your Location</Text>
              <Text style={styles.stepSubtitle}>
                Nur can optionally suggest real-world things to do nearby — a quiet park, a mosque, a halal-friendly place to eat — matched to how you're feeling.
              </Text>
              <View style={styles.infoList}>
                {[
                  {
                    icon: 'checkmark-circle-outline',
                    text: 'Always optional — check-ins work fully without it, every time.',
                  },
                  {
                    icon: 'time-outline',
                    text: "Only used in the moment a suggestion is generated — Nur doesn't track or store your location history.",
                  },
                  {
                    icon: 'options-outline',
                    text: "You'll see a standard permission prompt the first time it's relevant. You can decline, and change your mind anytime from your device Settings.",
                  },
                ].map((item) => (
                  <View key={item.text} style={styles.infoRow}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.primary} style={styles.infoIcon} />
                    <Text style={styles.infoText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Your Preferences</Text>
              <Text style={styles.stepSubtitle}>Choose your language and translation</Text>
              <Text style={styles.sectionLabel}>Language</Text>
              <View style={styles.optionsGrid}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.optionCard, selectedLanguage === lang.code && styles.optionCardSelected]}
                    onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedLanguage(lang.code); }}
                  >
                    <Text style={[styles.optionNative, selectedLanguage === lang.code && styles.optionNativeSelected]}>
                      {lang.native}
                    </Text>
                    <Text style={[styles.optionLabel, selectedLanguage === lang.code && styles.optionLabelSelected]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Quran Translation</Text>
              <View style={styles.translationOptions}>
                {TRANSLATIONS.map((tr) => (
                  <TouchableOpacity
                    key={tr.id}
                    style={[styles.translationCard, selectedTranslation === tr.id && styles.translationCardSelected]}
                    onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedTranslation(tr.id); }}
                  >
                    <View style={styles.translationInfo}>
                      <Text style={[styles.translationName, selectedTranslation === tr.id && styles.translationNameSelected]}>
                        {tr.label}
                      </Text>
                      <Text style={styles.translationDesc}>{tr.description}</Text>
                    </View>
                    {selectedTranslation === tr.id && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <View style={styles.disclaimerIcon}>
                <Text style={{ fontSize: 48 }}>☪</Text>
              </View>
              <Text style={styles.stepTitle}>A Note of Care</Text>
              <View style={styles.disclaimerCard}>
                <Text style={styles.disclaimerText}>
                  Nur surfaces Quranic wisdom to support your emotional and spiritual wellbeing. The verses and reflections offered are meant to inspire and comfort.
                </Text>
                <View style={styles.divider} />
                <Text style={styles.disclaimerText}>
                  Some content — including personalized reflections and emotional classification — is generated by AI and may occasionally be imperfect. For questions of Islamic rulings (fatwa) or religious guidance, always consult a qualified scholar.
                </Text>
                <View style={styles.divider} />
                <Text style={[styles.disclaimerText, styles.disclaimerImportant]}>
                  Nur is not a licensed medical, mental health, or religious authority, and is not a substitute for professional care. If you are in distress or experiencing a crisis, please contact a qualified counsellor, crisis service, or emergency services in your area immediately.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.acknowledgeRow}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setHasAcknowledged((v) => !v); }}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, hasAcknowledged && styles.checkboxChecked]}>
                  {hasAcknowledged && <Ionicons name="checkmark" size={14} color={Colors.surface} />}
                </View>
                <Text style={styles.acknowledgeText}>
                  I understand and agree to the above.
                </Text>
              </TouchableOpacity>
              <View style={styles.bismillah}>
                <Text style={styles.bismillahAr}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                <Text style={styles.bismillahEn}>In the name of Allah, the Most Gracious, the Most Merciful</Text>
              </View>
            </>
          )}
        </ScrollView>

        {renderDots()}

        {/* Action buttons */}
        <View style={styles.actions}>
          {step > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={() => goToStep(step - 1)}>
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          {step < LIABILITY_STEP ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => goToStep(step + 1)}
            >
              <Text style={styles.nextText}>Continue</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.surface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.startButton, !hasAcknowledged && styles.startButtonDisabled]}
              onPress={handleGetStarted}
              disabled={!hasAcknowledged}
              activeOpacity={0.85}
            >
              <Text style={styles.startText}>Begin Your Journey</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.xl,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.section + Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoAr: {
    fontSize: 72,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.arabic,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 90,
  },
  logoEn: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 8,
    fontWeight: Typography.fontWeight.semibold,
  },
  tagline: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * 1.7,
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.md,
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.fontSize.md * 1.5,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  optionNative: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  optionNativeSelected: {
    color: Colors.primary,
  },
  optionLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  translationOptions: {
    gap: Spacing.sm,
  },
  translationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  translationCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  translationInfo: {
    flex: 1,
  },
  translationName: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  translationNameSelected: {
    color: Colors.primary,
  },
  translationDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tutorialList: {
    gap: Spacing.md,
  },
  tutorialCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  tutorialNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialNumberText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.bold,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  tutorialTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  tutorialText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  infoList: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.fontSize.sm * 1.55,
  },
  disclaimerIcon: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  disclaimerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.65,
  },
  disclaimerImportant: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  acknowledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  acknowledgeText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  bismillah: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bismillahAr: {
    fontSize: Typography.fontSize.arabicLg,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.arabic,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 50,
  },
  bismillahEn: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    // transition not supported in RN — animation handled by Animated API
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  nextText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
});
