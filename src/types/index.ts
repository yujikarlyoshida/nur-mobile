export type EmotionState =
  | 'anxiety'
  | 'sadness'
  | 'anger'
  | 'loneliness'
  | 'gratitude'
  | 'hope'
  | 'guilt'
  | 'confusion'
  | 'peace'
  | 'overwhelmed'
  | 'grief'
  | 'disconnection'
  | 'joy';

export interface EmotionalProfile {
  primary_emotion: EmotionState;
  intensity: number; // 1-10
  spiritual_need: string;
  life_domain: string;
  themes: string[];
  reasoning: string;
  crisis?: boolean;
}

export interface VerseRecommendation {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  translation: string;
  transliteration?: string;
  personalized_note: string;
  relevance_score: number;
  tafsir_summary?: string;
  surah_name?: string;
  audio_url?: string;
}

export interface CheckinRequest {
  text?: string;
  emotion?: EmotionState;
  language?: string;
  translation_preference?: string;
  location?: LocationContext;
}

export interface CheckinResponse {
  checkin_id: string;
  emotional_profile: EmotionalProfile;
  recommendations: VerseRecommendation[];
  crisis_resources?: {
    message: string;
    hotlines: Array<{ name: string; number: string; url?: string }>;
  };
  activity_suggestions?: ActivitySuggestion[];
}

// ─── Real-World Activity Suggestions ──────────────────────────────────────────
// Mirrors backend/src/types/index.ts — see activityProvider.service.ts and
// recommendation.service.ts there for how these get generated.

export type ActivityCategory =
  | 'calm_nature'
  | 'physical_release'
  | 'social_gathering'
  | 'quiet_reflection'
  | 'adventure'
  | 'creative_or_learning'
  | 'service_or_community'
  | 'celebration';

export interface LocationContext {
  latitude: number;
  longitude: number;
  timezone?: string;
}

// "How busy/energetic" a suggestion is expected to be — estimated by the
// backend from rating/review volume/price/time-of-day, since Google's
// public Places API doesn't expose real foot-traffic data. See
// activityProvider.service.ts's estimateVibe() on the backend.
export type Vibe = 'quiet' | 'moderate' | 'lively';

export interface ActivitySuggestion {
  id: string;
  name: string;
  category: ActivityCategory;
  description: string;
  distance_km?: number;
  typical_hours?: string;
  is_open_now?: boolean;
  special_hours_today?: boolean;
  vibe?: Vibe;
  rating?: number;
  review_count?: number;
  relevance_score: number;
  source: 'sample' | 'google_places';
}

export interface SavedVerse {
  verse_key: string;
  arabic_text: string;
  translation: string;
  saved_at: string;
  personal_note?: string;
  surah_name?: string;
  surah_number?: number;
  ayah_number?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  emotion: EmotionState;
  intensity: number;
  text_input?: string;
  verses_received: number;
  checkin_id: string;
}

export interface UserProfile {
  name?: string;
  language: 'en' | 'ar' | 'ur' | 'ms';
  translation: string;
  notifications_enabled: boolean;
  onboarding_complete: boolean;
}

export interface SurahInfo {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}
