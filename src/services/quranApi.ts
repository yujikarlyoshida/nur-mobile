import axios from 'axios';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

export interface QuranApiVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: Array<{
    id: number;
    text: string;
    resource_name: string;
  }>;
}

export interface RecitationInfo {
  id: number;
  reciter_name: string;
  style?: string;
}

export interface AudioFile {
  verse_key: string;
  url: string;
  duration?: number;
}

const quranApiClient = axios.create({
  baseURL: QURAN_API_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export async function getVerseAudioUrl(
  verseKey: string,
  recitationId: number = 7 // Default: Mishary Alafasy
): Promise<string> {
  try {
    const response = await quranApiClient.get<{ audio_file: AudioFile }>(
      `/recitations/${recitationId}/by_ayah/${verseKey}`
    );
    const audioFile = response.data.audio_file;
    const relativePath = audioFile.url;
    return `https://verses.quran.com/${relativePath}`;
  } catch {
    // Fallback URL pattern using everyayah.com
    const [surahStr, ayahStr] = verseKey.split(':');
    const surah = parseInt(surahStr, 10);
    const ayah = parseInt(ayahStr, 10);
    const surahPadded = String(surah).padStart(3, '0');
    const ayahPadded = String(ayah).padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah}${ayahPadded}.mp3`;
  }
}

export async function getVerseWithArabic(
  verseKey: string,
  translationId: number = 131 // Default: Sahih International
): Promise<QuranApiVerse | null> {
  try {
    const response = await quranApiClient.get<{ verse: QuranApiVerse }>(
      `/verses/by_key/${verseKey}`,
      {
        params: {
          language: 'en',
          translations: translationId,
          fields: 'text_uthmani',
        },
      }
    );
    return response.data.verse;
  } catch {
    return null;
  }
}

export async function getSurahInfo(surahNumber: number): Promise<{
  name_simple: string;
  name_arabic: string;
  verses_count: number;
} | null> {
  try {
    const response = await quranApiClient.get<{
      chapter: { name_simple: string; name_arabic: string; verses_count: number };
    }>(`/chapters/${surahNumber}`, {
      params: { language: 'en' },
    });
    return response.data.chapter;
  } catch {
    return null;
  }
}

export const RECITERS: Array<{ id: number; name: string; style?: string }> = [
  { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
  { id: 1, name: 'Abdullah Basfar', style: 'Murattal' },
  { id: 2, name: 'Abdul Rahman Al-Sudais', style: 'Murattal' },
  { id: 3, name: 'Abu Bakr Al-Shatri', style: 'Murattal' },
  { id: 4, name: 'Hani Ar-Rifai', style: 'Murattal' },
];

export const TRANSLATION_IDS: Record<string, { id: number; name: string }> = {
  sahih_international: { id: 131, name: 'Sahih International' },
  pickthall: { id: 95, name: 'Pickthall' },
  yusuf_ali: { id: 203, name: 'Yusuf Ali' },
  clear_quran: { id: 57, name: 'The Clear Quran (Dr. Mustafa Khattab)' },
};
