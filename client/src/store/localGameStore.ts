'use client';

import { create } from 'zustand';
import {
  Match,
  Innings,
  Scoreboard,
  Ball,
  BallResultEvent,
  MatchEndEvent,
  MatchFormat,
  MatchSettings,
  MatchLiveState,
  PlayerMatchState,
  HandNumber,
  Player,
  generateId,
  resolveMatchSettings
} from '@hcl/shared';
import { MatchEngine } from '@hcl/shared';
import { AIAgent, AIDifficulty, AIProfile, AI_PROFILES } from '../lib/ai/AIAgent';
import { updateLocalStats } from '../lib/localStats';
import { sounds } from '../lib/sounds';
export type LocalScreen =
  | 'local-config'
  | 'local-toss'
  | 'local-match'
  | 'local-result';

interface LocalGameState {
  screen: LocalScreen;
  aiProfile: AIProfile | null;
  match: Match | null;
  currentInnings: Innings | null;
  scoreboard: Scoreboard | null;
  liveState: MatchLiveState | null;
  myRole: PlayerMatchState | null;
  ballHistory: Ball[];
  lastBallResult: BallResultEvent | null;
  matchEnd: MatchEndEvent | null;
  userPlayerId: string;
  aiPlayerId: string;
  userTossChoice: 'heads' | 'tails' | null;
  tossWinnerId: string | null;
  tossDecision: 'bat' | 'bowl' | null;
  isWaitingForChoice: boolean;
  moveSubmitted: boolean;
  movesReceived: number;
  aiThinking: boolean;

  setScreen: (screen: LocalScreen) => void;
  startMatch: (format: MatchFormat, customSettings: Partial<MatchSettings>, difficulty: AIDifficulty) => void;
  performToss: (choice: 'heads' | 'tails') => void;
  submitMove: (move: HandNumber) => void;
  resetLocalGame: () => void;
}

// Module-level singletons for local simulation
let engine: MatchEngine | null = null;
let agent: AIAgent | null = null;

export const useLocalGameStore = create<LocalGameState>((set, get) => ({
  screen: 'local-config',
  aiProfile: null,
  match: null,
  currentInnings: null,
  scoreboard: null,
  liveState: null,
  myRole: null,
  ballHistory: [],
  lastBallResult: null,
  matchEnd: null,
  userPlayerId: '',
  aiPlayerId: '',
  userTossChoice: null,
  tossWinnerId: null,
  tossDecision: null,
  isWaitingForChoice: false,
  moveSubmitted: false,
  movesReceived: 0,
  aiThinking: false,

  setScreen: (screen) => set({ screen }),

  startMatch: (format, customSettings, difficulty) => {
    const userPlayerId = generateId();
    const aiPlayerId = generateId();
    
    const userPlayer: Player = {
      id: userPlayerId, socketId: 'local-user', name: 'You',
      isHost: true, isReady: true, isConnected: true,
      stats: { runs: 0, ballsFaced: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, strikeRate: 0, economy: 0 }
    };
    const aiProfile = AI_PROFILES.find(p => p.difficulty === difficulty) || AI_PROFILES[0];
    const aiPlayer: Player = {
      id: aiPlayerId, socketId: 'local-ai', name: aiProfile.name,
      isHost: false, isReady: true, isConnected: true,
      stats: { runs: 0, ballsFaced: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, strikeRate: 0, economy: 0 }
    };

    const settings = resolveMatchSettings(format, customSettings);
    // Use customSettings.maxWickets if provided, else it falls back to presets
    
    const teams = MatchEngine.createTeams(
      { name: 'You', playerIds: [userPlayerId], captainId: userPlayerId },
      { name: aiProfile.name, playerIds: [aiPlayerId], captainId: aiPlayerId }
    );
    
    const newMatch = MatchEngine.createMatch('local-room', teams, settings);
    engine = new MatchEngine(newMatch, [userPlayer, aiPlayer]);
    agent = new AIAgent(difficulty);

    set({
      userPlayerId,
      aiPlayerId,
      aiProfile,
      match: { ...newMatch },
      currentInnings: null,
      scoreboard: newMatch.scoreboard ? { ...newMatch.scoreboard } : null,
      liveState: null,
      myRole: 'SPECTATING',
      ballHistory: [],
      lastBallResult: null,
      matchEnd: null,
      userTossChoice: null,
      tossWinnerId: null,
      tossDecision: null,
      isWaitingForChoice: false,
      moveSubmitted: false,
      movesReceived: 0,
      aiThinking: false,
    });
  },

  performToss: (choice) => {
    if (!engine) return;
    const { userPlayerId, aiPlayerId } = get();
    
    // Determine toss result
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
    const userWon = coinResult === choice;
    const winnerId = userWon ? userPlayerId : aiPlayerId;

    set({ userTossChoice: choice, tossWinnerId: winnerId });

    if (!userWon) {
      // AI won the toss — AI decides and we proceed automatically
      const aiDecision: 'bat' | 'bowl' = Math.random() > 0.5 ? 'bat' : 'bowl';
      set({ tossDecision: aiDecision });
      
      // Small delay then start the match
      setTimeout(() => {
        if (!engine) return;
        engine.setTossResult(winnerId, aiDecision);
        syncState(set, get);
      }, 1500);
    }
    // If user won, the UI will show bat/bowl choice buttons. 
    // User calls submitLocalInningsChoice() from the toss screen.
  },

  submitMove: (move) => {
    if (!engine || !agent) return;
    const state = get();
    const { userPlayerId, aiPlayerId } = state;
    
    // Re-read fresh match state from the engine (the engine mutates internally)
    const freshMatch = engine.getMatch();
    const freshInnings = freshMatch.innings[freshMatch.currentInnings - 1];
    if (!freshInnings) return;
    const freshLiveState = freshMatch.liveState;
    if (!freshLiveState) return;

    agent.recordUserMove(move);

    // Determine AI role for this ball
    const isAiBatting = freshInnings.currentBatsmanId === aiPlayerId;
    const aiRole: 'batsman' | 'bowler' = isAiBatting ? 'batsman' : 'bowler';

    // Submit user's move immediately
    try {
      engine.submitMove(userPlayerId, move);
      set({ moveSubmitted: true, aiThinking: true, movesReceived: 1 });

      // AI "thinks" for a short delay
      const thinkingMs = 500 + Math.random() * 1000;

      setTimeout(() => {
        if (!engine || !agent) return;
        
        // Re-read innings state for AI decision context
        const m = engine.getMatch();
        const inn = m.innings[m.currentInnings - 1];
        const ls = m.liveState || freshLiveState;
        
        const aiMove = agent.getMove(aiRole, inn, ls);
        const res = engine.submitMove(aiPlayerId, aiMove);

        // After both moves submitted, the engine returns a BallResultEvent
        if (res && 'ball' in res) {
          const resultEvent = res as BallResultEvent;
          
          sounds.reveal();
          if (resultEvent.isWicket) sounds.out();
          else sounds.runs(resultEvent.ball.runs);
          
          set(s => ({
            ballHistory: [...s.ballHistory, resultEvent.ball],
            lastBallResult: resultEvent,
            moveSubmitted: false,
            movesReceived: 0,
            aiThinking: false,
          }));
          syncState(set, get);

          // Re-read match after syncState to check completion
          const updatedMatch = engine.getMatch();
          const updatedInnings = updatedMatch.innings[updatedMatch.currentInnings - 1];

          if (updatedInnings && updatedInnings.isComplete) {
            if (updatedMatch.currentInnings === 1) {
              // First innings complete → start second innings after delay
              setTimeout(() => {
                if (!engine) return;
                engine.startSecondInnings();
                syncState(set, get);
              }, 3000);
            } else {
              // Second innings complete → calculate result
              const endEvent = engine.calculateMatchResult();
              const userTeamId = updatedMatch.teams[0].id;
              const userScore = endEvent.teamAScore.teamId === userTeamId ? endEvent.teamAScore : endEvent.teamBScore;
              const won = endEvent.winnerId === userTeamId;
              
              updateLocalStats({
                won,
                runs: userScore.runs,
                balls: userScore.overs * 6 + userScore.balls,
              });

              syncState(set, get);
              set({ matchEnd: endEvent });

              setTimeout(() => {
                useLocalGameStore.getState(); // ensure state settled
                set({ screen: 'local-result' });
              }, 2500);
            }
          } else {
            // Wait for the reveal animation (2.5s) then prepare the next ball
            setTimeout(() => {
              if (!engine) return;
              engine.beginBallPhase();
              syncState(set, get);
            }, 2500);
          }
        } else {
          // This shouldn't normally happen after both moves, but guard against it
          set({ aiThinking: false });
          syncState(set, get);
        }
      }, thinkingMs);
    } catch (e) {
      console.error('submitMove error:', e);
      set({ aiThinking: false, moveSubmitted: false });
    }
  },

  resetLocalGame: () => {
    engine = null;
    agent = null;
    set({
      screen: 'local-config',
      aiProfile: null,
      match: null,
      currentInnings: null,
      scoreboard: null,
      liveState: null,
      myRole: null,
      ballHistory: [],
      lastBallResult: null,
      matchEnd: null,
      userTossChoice: null,
      tossWinnerId: null,
      tossDecision: null,
      isWaitingForChoice: false,
      moveSubmitted: false,
      movesReceived: 0,
      aiThinking: false,
    });
  }
}));

// Called from the toss screen when the user wins and picks bat/bowl
export const submitLocalInningsChoice = (choice: 'bat' | 'bowl') => {
  if (!engine) return;
  const store = useLocalGameStore.getState();
  engine.setTossResult(store.userPlayerId, choice);
  useLocalGameStore.setState({ tossDecision: choice });
  syncState(useLocalGameStore.setState, useLocalGameStore.getState);
};

function syncState(set: any, get: any) {
  if (!engine) return;
  const match = engine.getMatch();
  const innings = match.currentInnings > 0 ? match.innings[match.currentInnings - 1] : null;
  const { userPlayerId } = get();

  let myRole: PlayerMatchState = 'SPECTATING';
  const playerState = match.liveState?.playerStates.find((p: any) => p.playerId === userPlayerId);
  if (playerState) {
    myRole = playerState.state;
  }

  set({
    match: { ...match },
    currentInnings: innings ? { ...innings } : null,
    scoreboard: match.scoreboard ? { ...match.scoreboard } : null,
    liveState: match.liveState ? { ...match.liveState } : null,
    myRole,
    isWaitingForChoice: match.liveState?.ballPhase === 'waiting-moves',
  });
}
