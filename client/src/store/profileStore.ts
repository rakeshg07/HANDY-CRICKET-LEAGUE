'use client';

import { create } from 'zustand';
import {
  PlayerProfile,
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  getWinPercentage,
  getRank,
} from '@/lib/profileStorage';

interface ProfileState {
  profile: PlayerProfile;
  hydrated: boolean;
  hydrate: () => void;
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  recordMatch: (result: 'win' | 'loss' | 'draw', runs: number, opponent: string, score: string) => void;
  winPercentage: () => number;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  hydrated: false,

  hydrate: () => {
    const profile = loadProfile();
    set({ profile, hydrated: true });
  },

  updateProfile: (updates) => {
    const profile = { ...get().profile, ...updates };
    if (updates.matchesPlayed !== undefined || updates.wins !== undefined) {
      profile.rank = getRank(profile.matchesPlayed, profile.wins);
    }
    saveProfile(profile);
    set({ profile });
  },

  recordMatch: (result, runs, opponent, score) => {
    const profile = { ...get().profile };
    profile.matchesPlayed++;
    if (result === 'win') profile.wins++;
    if (result === 'loss') profile.losses++;
    profile.totalRuns += runs;
    if (runs > profile.highestScore) profile.highestScore = runs;
    profile.rank = getRank(profile.matchesPlayed, profile.wins);
    profile.recentMatches = [
      { opponent, result, score, date: new Date().toLocaleDateString() },
      ...profile.recentMatches.slice(0, 9),
    ];
    saveProfile(profile);
    set({ profile });
  },

  winPercentage: () => getWinPercentage(get().profile),
}));
