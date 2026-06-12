'use client';

import { useGameStore } from '@/store/gameStore';
import { useSocketInit } from '@/hooks/useSocket';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { MatchHistoryScreen } from '@/components/screens/MatchHistoryScreen';
import { FriendsScreen } from '@/components/screens/FriendsScreen';
import { RulesScreen } from '@/components/screens/RulesScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { MultiplayerTestScreen } from '@/components/screens/MultiplayerTestScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { TeamScreen } from '@/components/screens/TeamScreen';
import { TossScreen } from '@/components/screens/TossScreen';
import { MatchScreen } from '@/components/screens/MatchScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { LocalConfigScreen } from '@/components/screens/local/LocalConfigScreen';
import { LocalTossScreen } from '@/components/screens/local/LocalTossScreen';
import { LocalMatchScreen } from '@/components/screens/local/LocalMatchScreen';
import { LocalResultScreen } from '@/components/screens/local/LocalResultScreen';

export function GameRouter() {
  useSocketInit();
  const screen = useGameStore((s) => s.screen);

  const dashboardScreens: Record<string, React.ReactNode> = {
    home: <HomeScreen />,
    profile: <ProfileScreen />,
    statistics: <ProfileScreen />,
    history: <MatchHistoryScreen />,
    friends: <FriendsScreen />,
    rules: <RulesScreen />,
    settings: <SettingsScreen />,
    leaderboard: <LeaderboardScreen />,
  };

  const gameScreens: Record<string, React.ReactNode> = {
    'test-match': <MultiplayerTestScreen />,
    lobby: <LobbyScreen />,
    teams: <TeamScreen />,
    toss: <TossScreen />,
    match: <MatchScreen />,
    result: <ResultScreen />,
    'local-config': <LocalConfigScreen />,
    'local-toss': <LocalTossScreen />,
    'local-match': <LocalMatchScreen />,
    'local-result': <LocalResultScreen />,
  };

  let currentView;
  if (dashboardScreens[screen]) {
    currentView = <DashboardLayout>{dashboardScreens[screen]}</DashboardLayout>;
  } else {
    currentView = gameScreens[screen];
  }

  return <AppShell>{currentView}</AppShell>;
}

