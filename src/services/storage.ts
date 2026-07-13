import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, SavedVerse, UserProfile } from '../types';

const KEYS = {
  SAVED_VERSES: 'nur_saved_verses',
  JOURNAL_ENTRIES: 'nur_journal_entries',
  USER_PROFILE: 'nur_user_profile',
  ONBOARDING_COMPLETE: 'nur_onboarding_complete',
} as const;

// ─── Saved Verses ─────────────────────────────────────────────────────────────

export async function getSavedVerses(): Promise<SavedVerse[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SAVED_VERSES);
    if (!raw) return [];
    return JSON.parse(raw) as SavedVerse[];
  } catch {
    return [];
  }
}

export async function saveVerse(verse: SavedVerse): Promise<void> {
  const current = await getSavedVerses();
  const exists = current.find((v) => v.verse_key === verse.verse_key);
  if (!exists) {
    const updated = [verse, ...current];
    await AsyncStorage.setItem(KEYS.SAVED_VERSES, JSON.stringify(updated));
  }
}

export async function unsaveVerse(verseKey: string): Promise<void> {
  const current = await getSavedVerses();
  const updated = current.filter((v) => v.verse_key !== verseKey);
  await AsyncStorage.setItem(KEYS.SAVED_VERSES, JSON.stringify(updated));
}

export async function updateVerseNote(verseKey: string, note: string): Promise<void> {
  const current = await getSavedVerses();
  const updated = current.map((v) =>
    v.verse_key === verseKey ? { ...v, personal_note: note } : v
  );
  await AsyncStorage.setItem(KEYS.SAVED_VERSES, JSON.stringify(updated));
}

// ─── Journal Entries ───────────────────────────────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export async function addJournalEntry(entry: JournalEntry): Promise<void> {
  const current = await getJournalEntries();
  const updated = [entry, ...current];
  await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(updated));
}

export async function clearJournalEntries(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.JOURNAL_ENTRIES);
}

// ─── User Profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (!raw) {
      return {
        language: 'en',
        translation: 'sahih_international',
        notifications_enabled: true,
        onboarding_complete: false,
      };
    }
    return JSON.parse(raw) as UserProfile;
  } catch {
    return {
      language: 'en',
      translation: 'sahih_international',
      notifications_enabled: true,
      onboarding_complete: false,
    };
  }
}

export async function updateUserProfile(partial: Partial<UserProfile>): Promise<void> {
  const current = await getUserProfile();
  const updated = { ...current, ...partial };
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(updated));
}

// ─── Onboarding ────────────────────────────────────────────────────────────────

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  await updateUserProfile({ onboarding_complete: true });
}

// ─── Data Deletion ─────────────────────────────────────────────────────────────

export async function deleteAllUserData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.SAVED_VERSES,
    KEYS.JOURNAL_ENTRIES,
    KEYS.USER_PROFILE,
    KEYS.ONBOARDING_COMPLETE,
  ]);
}
