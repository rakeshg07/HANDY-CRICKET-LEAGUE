'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalGameStore } from '@/store/localGameStore';
import { useGameStore } from '@/store/gameStore';
import { Scoreboard } from '@/components/game/Scoreboard';
import { BallHistory } from '@/components/game/BallHistory';
import { HandSelector } from '@/components/game/HandSelector';
import { BallReveal } from '@/components/game/BallReveal';
import { GlassCard } from '@/components/ui/GlassCard';
import { HandNumber } from '@hcl/shared';

export function LocalMatchScreen() {
  const {
    scoreboard,
    currentInnings,
    userPlayerId,
    ballHistory,
    lastBallResult,
    isWaitingForChoice,
    moveSubmitted,
    movesReceived,
    liveState,
    myRole,
    match,
    aiThinking,
    aiProfile,
    submitMove,
    matchEnd,
  } = useLocalGameStore();
  const setGameScreen = useGameStore((s) => s.setScreen);

  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (lastBallResult) {
      setShowReveal(true);
      const timer = setTimeout(() => setShowReveal(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [lastBallResult]);

  // Navigate to result screen when matchEnd is set
  useEffect(() => {
    if (matchEnd) {
      const t = setTimeout(() => setGameScreen('local-result'), 2500);
      return () => clearTimeout(t);
    }
  }, [matchEnd, setGameScreen]);

  if (!scoreboard || !currentInnings || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">🏏</div>
          <p className="text-white/70">Loading match...</p>
        </div>
      </div>
    );
  }

  const canInteract = (myRole === 'BATTING' || myRole === 'BOWLING') && !moveSubmitted;

  const handleSelect = (number: HandNumber) => {
    if (!canInteract) return;
    submitMove(number);
  };

  return (
    <div className="min-h-screen p-4 relative z-10 pb-24">
      {showReveal && lastBallResult && <BallReveal result={lastBallResult} />}

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-2 space-y-1">
            <div className="inline-block px-4 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
              <span className="text-xs text-blue-300 uppercase tracking-widest font-bold">
                ⚡ Quick Play vs {aiProfile?.avatar} {aiProfile?.name}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                Innings {currentInnings.number}
                {currentInnings.target && ` · Target: ${currentInnings.target}`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Scoreboard */}
        <Scoreboard
          scoreboard={scoreboard}
          totalOvers={match.settings.overs}
          recentBalls={ballHistory.slice(-6)}
        />

        {/* Hand Selector / AI Thinking / Waiting */}
        <GlassCard className="p-4">
          {aiThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 space-y-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-4xl"
              >
                {aiProfile?.avatar || '🤖'}
              </motion.div>
              <p className="text-lg font-bold text-white animate-pulse">
                {aiProfile?.name} is thinking...
              </p>
            </motion.div>
          )}

          {!aiThinking && isWaitingForChoice && liveState?.ballPhase === 'waiting-moves' && (
            <HandSelector
              role={myRole}
              onSelect={handleSelect}
              submitted={moveSubmitted}
              disabled={!canInteract}
              movesReceived={movesReceived}
              batsmanName={liveState.batsmanName}
              bowlerName={liveState.bowlerName}
            />
          )}

          {!aiThinking && (!isWaitingForChoice || liveState?.ballPhase !== 'waiting-moves') && !showReveal && (
            <div className="text-center py-8 text-gray-400">
              {liveState?.ballPhase === 'processing' || liveState?.ballPhase === 'revealing'
                ? 'Revealing...'
                : currentInnings.isComplete
                  ? (currentInnings.number === 1
                    ? 'Innings complete — switching sides...'
                    : 'Match complete!')
                  : 'Preparing next ball...'}
            </div>
          )}
        </GlassCard>

        {/* Ball History */}
        <BallHistory balls={ballHistory} />
      </div>
    </div>
  );
}
