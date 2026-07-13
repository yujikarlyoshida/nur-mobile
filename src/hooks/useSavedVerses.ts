import { useState, useEffect, useCallback } from 'react';
import {
  getSavedVerses,
  saveVerse as storeSaveVerse,
  unsaveVerse as storeUnsaveVerse,
} from '../services/storage';
import { SavedVerse, VerseRecommendation } from '../types';

interface UseSavedVersesReturn {
  savedVerses: SavedVerse[];
  saveVerse: (verse: VerseRecommendation) => Promise<void>;
  unsaveVerse: (verseKey: string) => Promise<void>;
  isSaved: (verseKey: string) => boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSavedVerses(): UseSavedVersesReturn {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const verses = await getSavedVerses();
    setSavedVerses(verses);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveVerse = useCallback(
    async (verse: VerseRecommendation) => {
      const savedVerse: SavedVerse = {
        verse_key: verse.verse_key,
        arabic_text: verse.arabic_text,
        translation: verse.translation,
        saved_at: new Date().toISOString(),
        surah_name: verse.surah_name,
        surah_number: verse.surah_number,
        ayah_number: verse.ayah_number,
      };
      await storeSaveVerse(savedVerse);
      setSavedVerses((prev) => {
        const exists = prev.find((v) => v.verse_key === verse.verse_key);
        if (exists) return prev;
        return [savedVerse, ...prev];
      });
    },
    []
  );

  const unsaveVerse = useCallback(async (verseKey: string) => {
    await storeUnsaveVerse(verseKey);
    setSavedVerses((prev) => prev.filter((v) => v.verse_key !== verseKey));
  }, []);

  const isSaved = useCallback(
    (verseKey: string) => savedVerses.some((v) => v.verse_key === verseKey),
    [savedVerses]
  );

  return {
    savedVerses,
    saveVerse,
    unsaveVerse,
    isSaved,
    loading,
    refresh,
  };
}
