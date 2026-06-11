'use client';

import { useGameStore } from '@/store/gameStore';
import { useSocketInit } from '@/hooks/useSocket';
import { AppShell } from '@/components/layout/AppShell';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { RulesScreen } from '@/components/screens/RulesScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { MultiplayerTestScreen } from '@/components/screens/MultiplayerTestScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { TeamScreen } from '@/components/screens/TeamScreen';
import { TossScreen } from '@/components/screens/TossScreen';
import { MatchScreen } from '@/components/screens/MatchScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';

export function GameRouter() {
  useSocketInit();
  const screen = useGameStore((s) => s.screen);

  const screens = {
    home: <HomeScreen />,
    profile: <ProfileScreen />,
    rules: <RulesScreen />,
    settings: <SettingsScreen />,
    'test-match': <MultiplayerTestScreen />,
    lobby: <LobbyScreen />,
    teams: <TeamScreen />,
    toss: <TossScreen />,
    match: <MatchScreen />,
    result: <ResultScreen />,
    leaderboard: <LeaderboardScreen />,
  };

  return <AppShell>{screens[screen]}</AppShell>;
}
