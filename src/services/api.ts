import axios, { AxiosError, AxiosInstance } from 'axios';
import { CheckinRequest, CheckinResponse, EmotionState, VerseRecommendation } from '../types';

// Sourced from the EXPO_PUBLIC_API_BASE_URL env var (see .env.production / .env.example),
// not app.json's `extra` — Metro's babel-preset-expo inlines EXPO_PUBLIC_* vars into the
// bundle at build time for *both* native and web, whereas Constants.expoConfig.extra was
// found to never actually get embedded in a plain `expo export -p web` build (verified by
// grepping the exported bundle — app.json's extra values were silently absent, so the app
// was always falling back to a hardcoded default no matter what app.json said). Falls back
// to localhost:3000 when unset, matching local dev against a locally-running backend.
// IMPORTANT: this must stay pure, unwrapped `process.env.EXPO_PUBLIC_...` dot
// notation — Metro's babel-preset-expo statically replaces exactly that AST
// shape at build time (it pattern-matches the MemberExpression's object
// against literal `process.env`). Bracket notation, routing through an
// intermediate variable, OR wrapping `process` in a cast like
// `(process as any).env.X` all change the AST enough that the matcher misses
// it — verified by grepping an actual export each time: the env var name
// stayed in the bundle as plain text and the fallback always won at runtime
// (browsers have no real process.env). The `@ts-expect-error` below exists so
// this can stay unwrapped rather than reaching for one of those.
// @ts-expect-error EXPO_PUBLIC_API_BASE_URL is inlined by Metro at build time — not a real ambient ProcessEnv key
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        const data = error.response.data as { message?: string; error?: string } | undefined;
        const message =
          data?.message || data?.error || `Request failed with status ${statusCode}`;
        throw new ApiError(message, statusCode, data);
      } else if (error.request) {
        throw new ApiError(
          'Network error: unable to reach the server. Please check your connection.',
          0
        );
      } else {
        throw new ApiError(error.message || 'An unexpected error occurred', -1);
      }
    }
  );

  return client;
}

const apiClient = createApiClient();

export async function submitCheckin(data: CheckinRequest): Promise<CheckinResponse> {
  // Map frontend shape → backend shape
  const body: Record<string, unknown> = {
    input_type: data.text ? 'text' : 'mood_select',
    language: data.language,
  };
  if (data.text) body['text'] = data.text;
  if (data.emotion) body['mood_selected'] = data.emotion;
  if (data.location) body['location'] = data.location;

  const response = await apiClient.post<CheckinResponse>('/api/checkin', body);
  return response.data;
}

export async function getVerseByKey(verseKey: string): Promise<VerseRecommendation> {
  const response = await apiClient.get<VerseRecommendation>(`/api/verses/${verseKey}`);
  return response.data;
}

export async function searchVerses(query: string): Promise<VerseRecommendation[]> {
  const response = await apiClient.get<VerseRecommendation[]>('/api/verses/search', {
    params: { q: query },
  });
  return response.data;
}

export async function getVersesByEmotion(emotion: EmotionState): Promise<VerseRecommendation[]> {
  const response = await apiClient.get<VerseRecommendation[]>(`/api/verses/emotion/${emotion}`);
  return response.data;
}
