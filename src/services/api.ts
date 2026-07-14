import axios, { AxiosError, AxiosInstance } from 'axios';
import { CheckinRequest, CheckinResponse, EmotionState, VerseRecommendation } from '../types';

const API_BASE_URL = 'http://nur-backend-prod.eba-2ujhpf2u.us-east-1.elasticbeanstalk.com';

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
