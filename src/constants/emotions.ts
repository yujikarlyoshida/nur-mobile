import { EmotionState } from '../types';
import { Colors } from './theme';

export interface EmotionConfig {
  label: string;
  labelAr: string;
  color: string;
  icon: string; // emoji
  vectorIcon?: string; // @expo/vector-icons name
  description: string;
}

export const EMOTIONS: Record<EmotionState, EmotionConfig> = {
  anxiety: {
    label: 'Anxiety',
    labelAr: 'القلق',
    color: Colors.emotionAnxiety,
    icon: '😰',
    description: 'Feeling worried or uneasy about the future',
  },
  sadness: {
    label: 'Sadness',
    labelAr: 'الحزن',
    color: Colors.emotionSadness,
    icon: '😢',
    description: 'Feeling sorrow or unhappiness',
  },
  anger: {
    label: 'Anger',
    labelAr: 'الغضب',
    color: Colors.emotionAnger,
    icon: '😠',
    description: 'Feeling frustrated or irritated',
  },
  loneliness: {
    label: 'Loneliness',
    labelAr: 'الوحدة',
    color: Colors.emotionLoneliness,
    icon: '🥺',
    description: 'Feeling isolated or disconnected from others',
  },
  gratitude: {
    label: 'Gratitude',
    labelAr: 'الشكر',
    color: Colors.emotionGratitude,
    icon: '🤲',
    description: 'Feeling thankful and appreciative',
  },
  hope: {
    label: 'Hope',
    labelAr: 'الأمل',
    color: Colors.emotionHope,
    icon: '🌟',
    description: 'Feeling optimistic about the future',
  },
  guilt: {
    label: 'Guilt',
    labelAr: 'الذنب',
    color: Colors.emotionGuilt,
    icon: '😔',
    description: 'Feeling remorseful about past actions',
  },
  confusion: {
    label: 'Confusion',
    labelAr: 'الارتباك',
    color: Colors.emotionConfusion,
    icon: '😕',
    description: 'Feeling uncertain or unclear about something',
  },
  peace: {
    label: 'Peace',
    labelAr: 'السكينة',
    color: Colors.emotionPeace,
    icon: '☮️',
    description: 'Feeling calm and at rest within your heart',
  },
  overwhelmed: {
    label: 'Overwhelmed',
    labelAr: 'الإرهاق',
    color: Colors.emotionOverwhelmed,
    icon: '😵',
    description: 'Feeling buried under too much at once',
  },
  grief: {
    label: 'Grief',
    labelAr: 'الحداد',
    color: Colors.emotionGrief,
    icon: '💔',
    description: 'Deep sorrow, often from loss of a loved one',
  },
  disconnection: {
    label: 'Disconnection',
    labelAr: 'الانفصال',
    color: Colors.emotionDisconnection,
    icon: '🌫️',
    description: 'Feeling spiritually or emotionally distant',
  },
  joy: {
    label: 'Joy',
    labelAr: 'الفرح',
    color: Colors.emotionJoy,
    icon: '😊',
    description: 'Feeling happiness and delight',
  },
};

export const EMOTION_ORDER: EmotionState[] = [
  'anxiety',
  'sadness',
  'anger',
  'loneliness',
  'gratitude',
  'hope',
  'guilt',
  'confusion',
  'peace',
  'overwhelmed',
  'grief',
  'disconnection',
  'joy',
];
