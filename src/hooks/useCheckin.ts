import { useState, useCallback } from 'react';
import { submitCheckin as apiSubmitCheckin, ApiError } from '../services/api';
import { addJournalEntry } from '../services/storage';
import { getCurrentLocationContext } from '../services/location';
import { CheckinRequest, CheckinResponse } from '../types';

interface UseCheckinState {
  loading: boolean;
  error: string | null;
  result: CheckinResponse | null;
}

interface UseCheckinReturn extends UseCheckinState {
  submit: (data: CheckinRequest) => Promise<CheckinResponse | null>;
  reset: () => void;
}

export function useCheckin(): UseCheckinReturn {
  const [state, setState] = useState<UseCheckinState>({
    loading: false,
    error: null,
    result: null,
  });

  const submit = useCallback(async (data: CheckinRequest): Promise<CheckinResponse | null> => {
    setState({ loading: true, error: null, result: null });

    try {
      // Attach the user's location if we can get it, so the backend can
      // return activity_suggestions alongside verses. Fails soft to
      // `null` (permission denied, location off, etc.) — a check-in
      // without location behaves exactly as it always has.
      const location = data.location ?? (await getCurrentLocationContext()) ?? undefined;
      const response = await apiSubmitCheckin({ ...data, location });

      // Persist journal entry
      await addJournalEntry({
        id: response.checkin_id,
        date: new Date().toISOString(),
        emotion: response.emotional_profile.primary_emotion,
        intensity: response.emotional_profile.intensity,
        text_input: data.text,
        verses_received: response.recommendations.length,
        checkin_id: response.checkin_id,
      });

      setState({ loading: false, error: null, result: response });
      return response;
    } catch (err) {
      let errorMessage = 'Something went wrong. Please try again.';

      if (err instanceof ApiError) {
        if (err.statusCode === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.statusCode >= 500) {
          errorMessage = 'Our servers are experiencing issues. Please try again shortly.';
        } else if (err.statusCode === 429) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setState({ loading: false, error: errorMessage, result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
}
