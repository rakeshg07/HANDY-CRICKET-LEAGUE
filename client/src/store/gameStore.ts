'use client';

import { create } from 'zustand';
import {
  Room,
  Match,
  Player,
  Team,
  Innings,
  Scoreboard,
  Ball,
  BallResultEvent,
  MatchEndEvent,
  MatchFormat,
  MatchSettings,
  MatchLiveState,
  PlayerMatchState,
} from '@hcl/shared';

export type GameScreen =
  | 'home'
  | 'profile'
  | 'rules'
  | 'settings'
  | 'test-match'
  | 'lobby'
  | 'teams'
  | 'toss'
  | 'match'
  | 'result'
  | 'leaderboard';

interface GameState {
  screen: GameScreen;
  playerId: string | null;
  playerName: string;
  room: Room | null;
  match: Match | null;
  currentInnings: Innings | null;
  scoreboard: Scoreboard | null;
  liveState: MatchLiveState | null;
  myRole: PlayerMatchState | null;
  ballHistory: Ball[];
  lastBallResult: BallResultEvent | null;
  matchEnd: MatchEndEvent | null;
  isWaitingForChoice: boolean;
  moveSubmitted: boolean;
  movesReceived: number;
  tossWinner: { id: string; name: string } | null;
  error: string | null;
  isConnected: boolean;
  matchSettings: Partial<MatchSettings>;

  setScreen: (screen: GameScreen) => void;
  setPlayerName: (name: string) => void;
  setPlayerId: (id: string) => void;
  setRoom: (room: Room) => void;
  setMatch: (match: Match) => void;
  setMatchSettings: (settings: Partial<MatchSettings>) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setTeams: (teams: Team[]) => void;
  setTossWinner: (id: string, name: string) => void;
  setInnings: (innings: Innings, scoreboard: Scoreboard, liveState: MatchLiveState) => void;
  setLiveState: (liveState: MatchLiveState) => void;
  setBallResult: (result: BallResultEvent) => void;
  setMatchEnd: (event: MatchEndEvent) => void;
  setWaitingForChoice: (waiting: boolean) => void;
  setMoveSubmitted: (submitted: boolean) => void;
  setMovesReceived: (count: number) => void;
  reset: () => void;
}

const initialState = {
  screen: 'home' as GameScreen,
  playerId: null,
  playerName: '',
  room: null,
  match: null,
  currentInnings: null,
  scoreboard: null,
  liveState: null,
  myRole: null as PlayerMatchState | null,
  ballHistory: [] as Ball[],
  lastBallResult: null,
  matchEnd: null,
  isWaitingForChoice: false,
  moveSubmitted: false,
  movesReceived: 0,
  tossWinner: null,
  error: null,
  isConnected: false,
  matchSettings: { format: 'T20' as MatchFormat },
};

function resolveMyRole(liveState: MatchLiveState | null, playerId: string | null): PlayerMatchState | null {
  if (!liveState || !playerId) return null;
  return liveState.playerStates.find((p) => p.playerId === playerId)?.state ?? null;
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),
  setPlayerName: (name) => set({ playerName: name }),
  setPlayerId: (id) => set({ playerId: id }),

  setRoom: (room) => {
    const playerId = get().playerId;
    const me = room.players.find((p) => p.id === playerId || p.socketId);
    if (me && !playerId) set({ playerId: me.id });
    set({ room, screen: 'lobby' });
  },

  setMatch: (match) => set({ match, screen: 'toss' }),

  setMatchSettings: (settings) =>
    set((s) => ({ matchSettings: { ...s.matchSettings, ...settings } })),

  setError: (error) => set({ error }),
  setConnected: (connected) => set({ isConnected: connected }),

  updatePlayerReady: (playerId, isReady) =>
    set((s) => ({
      room: s.room
        ? {
            ...s.room,
            players: s.room.players.map((p) =>
              p.id === playerId ? { ...p, isReady } : p
            ),
          }
        : null,
    })),

  addPlayer: (player) =>
    set((s) => ({
      room: s.room ? { ...s.room, players: [...s.room.players, player] } : null,
    })),

  removePlayer: (playerId) =>
    set((s) => ({
      room: s.room
        ? { ...s.room, players: s.room.players.filter((p) => p.id !== playerId) }
        : null,
    })),

  setTeams: (teams) =>
    set((s) => ({
      room: s.room ? { ...s.room, teams, status: 'team-formation' } : null,
      screen: 'teams',
    })),

  setTossWinner: (id, name) => set({ tossWinner: { id, name } }),

  setInnings: (innings, scoreboard, liveState) => {
    const playerId = get().playerId;
    set({
      currentInnings: innings,
      scoreboard,
      liveState,
      myRole: resolveMyRole(liveState, playerId),
      screen: 'match',
      isWaitingForChoice: true,
      moveSubmitted: false,
      movesReceived: 0,
    });
  },

  setLiveState: (liveState) => {
    const playerId = get().playerId;
    set({
      liveState,
      myRole: resolveMyRole(liveState, playerId),
      isWaitingForChoice: liveState.ballPhase === 'waiting-moves',
      moveSubmitted: false,
      movesReceived: liveState.movesReceived,
    });
  },

  setBallResult: (result) =>
    set((s) => ({
      lastBallResult: result,
      scoreboard: result.scoreboard,
      liveState: result.liveState,
      myRole: resolveMyRole(result.liveState, s.playerId),
      ballHistory: [...s.ballHistory, result.ball],
      isWaitingForChoice: false,
      moveSubmitted: false,
      movesReceived: 0,
    })),

  setMatchEnd: (event) => set({ matchEnd: event, screen: 'result' }),

  setWaitingForChoice: (waiting) =>
    set({
      isWaitingForChoice: waiting,
      moveSubmitted: false,
      movesReceived: waiting ? 0 : get().movesReceived,
      lastBallResult: waiting ? null : get().lastBallResult,
    }),

  setMoveSubmitted: (submitted) => set({ moveSubmitted: submitted }),
  setMovesReceived: (count) => set({ movesReceived: count }),

  reset: () => set(initialState),
}));
