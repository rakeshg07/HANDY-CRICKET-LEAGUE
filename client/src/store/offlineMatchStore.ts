'use client';

import { create } from 'zustand';
import { HandNumber, BallResultEvent, MatchFormat } from '@hcl/shared';
import {
  OfflineMatchState,
  createOfflineMatch,
  simulateBall,
  startSecondInnings,
  buildOfflineScoreboard,
  calculateOfflineResult,
  simulateRandomBall,
} from '@/lib/offlineEngine';

interface OfflineMatchStore {
  match: OfflineMatchState | null;
  lastResult: BallResultEvent | null;
  showReveal: boolean;
  bowlerChoice: HandNumber | null;
  batsmanChoice: HandNumber | null;
  pendingBowler: HandNumber | null;
  pendingBatsman: HandNumber | null;

  initMatch: (format?: MatchFormat, teamSize?: number, overs?: number, matchName?: string) => void;
  setBowlerChoice: (n: HandNumber) => void;
  setBatsmanChoice: (n: HandNumber) => void;
  submitChoices: () => void;
  simulateRandom: () => void;
  switchInnings: () => void;
  restartMatch: () => void;
  reset: () => void;
  dismissReveal: () => void;
}

export const useOfflineMatchStore = create<OfflineMatchStore>((set, get) => ({
  match: null,
  lastResult: null,
  showReveal: false,
  bowlerChoice: null,
  batsmanChoice: null,
  pendingBowler: null,
  pendingBatsman: null,

  initMatch: (format, teamSize, overs, matchName) => {
    set({
      match: createOfflineMatch(format ?? 'T10', teamSize ?? 2, overs, matchName),
      lastResult: null,
      showReveal: false,
      bowlerChoice: null,
      batsmanChoice: null,
      pendingBowler: null,
      pendingBatsman: null,
    });
  },

  setBowlerChoice: (n) => set({ pendingBowler: n, bowlerChoice: n }),
  setBatsmanChoice: (n) => set({ pendingBatsman: n, batsmanChoice: n }),

  submitChoices: () => {
    const { match, pendingBowler, pendingBatsman } = get();
    if (!match || pendingBowler === null || pendingBatsman === null) return;

    const { state, result } = simulateBall(
      match,
      pendingBowler,
      pendingBatsman
    );

    set({
      match: state,
      lastResult: result,
      showReveal: true,
      pendingBowler: null,
      pendingBatsman: null,
      bowlerChoice: null,
      batsmanChoice: null,
    });
  },

  simulateRandom: () => {
    const { match } = get();
    if (!match || match.phase === 'result') return;

    const { state, result } = simulateRandomBall(match);
    set({ match: state, lastResult: result, showReveal: true });
  },

  switchInnings: () => {
    const { match } = get();
    if (!match) return;
    if (match.currentInnings === 1) {
      set({ match: startSecondInnings(match), showReveal: false, lastResult: null });
    }
  },

  restartMatch: () => {
    const { match } = get();
    if (!match) return;
    get().initMatch(match.settings.format, match.settings.playersPerTeam, match.settings.overs, match.settings.matchName);
  },

  reset: () =>
    set({
      match: null,
      lastResult: null,
      showReveal: false,
      bowlerChoice: null,
      batsmanChoice: null,
      pendingBowler: null,
      pendingBatsman: null,
    }),

  dismissReveal: () => set({ showReveal: false }),
}));
