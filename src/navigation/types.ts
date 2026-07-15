import { NavigatorScreenParams } from '@react-navigation/native';
import { CheckinResponse, VerseRecommendation } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  // Optional (not just NavigatorScreenParams<MainTabParamList>) because
  // every screen in MainTabParamList takes `undefined` params — callers
  // like `navigation.navigate('MainTabs')` should be able to omit the
  // second argument entirely rather than being forced to pass `undefined`
  // params explicitly.
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  SignIn: undefined;
  TwoFactorVerify: {
    factorId: string;
  };
  TwoFactorSetup: undefined;
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
