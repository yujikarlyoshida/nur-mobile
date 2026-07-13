import { NavigatorScreenParams } from '@react-navigation/native';
import { CheckinResponse, VerseRecommendation } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  VerseDetail: {
    verse: VerseRecommendation;
    audioUrl?: string;
  };
  VerseDiscovery: {
    checkinResponse: CheckinResponse;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Discovery: undefined;
  Journal: undefined;
  Profile: undefined;
};
