'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { Scoreboard } from '@/components/game/Scoreboard';
import { BallHistory } from '@/components/game/BallHistory';
import { HandSelector } from '@/components/game/HandSelector';
import { BallReveal } from '@/components/game/BallReveal';
import { PlayerRoleBar } from '@/components/game/PlayerRoleBar';
import { HandNumber } from '@hcl/shared';

export function MatchScreen() {
  const {
    scoreboard,
    currentInnings,
    playerId,
    ballHistory,
    lastBallResult,
    isWaitingForChoice,
    moveSubmitted,
    movesReceived,
    liveState,
    myRole,
  } = useGameStore();
  const { submitMove } = useSocket();
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (lastBallResult) {
      setShowReveal(true);
      const timer = setTimeout(() => setShowReveal(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [lastBallResult]);

  if (!scoreboard || !currentInnings) return null;

  const canInteract = myRole === 'BATTING' || myRole === 'BOWLING';

  const handleSelect = (number: HandNumber) => {
    if (!canInteract || moveSubmitted) return;
    submitMove(number);
  };

  return (
    <div className="min-h-screen p-4 relative z-10 pb-24">
      {showReveal && lastBallResult && <BallReveal result={lastBallResult} />}

      <div className="max-w-2xl mx-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              Innings {currentInnings.number}
              {currentInnings.target && ` — Target: ${currentInnings.target}`}
            </span>
          </div>
        </motion.div>

        <PlayerRoleBar liveState={liveState} myPlayerId={playerId} />
        <Scoreboard scoreboard={scoreboard} />

        <div className="glass p-4 rounded-2xl">
          {isWaitingForChoice && liveState?.ballPhase === 'waiting-moves' && (
            <HandSelector
              role={myRole}
              onSelect={handleSelect}
              submitted={moveSubmitted}
              disabled={!canInteract || moveSubmitted}
              movesReceived={movesReceived}
              batsmanName={liveState.batsmanName}
              bowlerName={liveState.bowlerName}
            />
          )}

          {(!isWaitingForChoice || liveState?.ballPhase !== 'waiting-moves') && !showReveal && (
            <div className="text-center py-8 text-gray-500">
              {liveState?.ballPhase === 'processing' || liveState?.ballPhase === 'revealing'
                ? 'Revealing ball result...'
                : 'Waiting for next ball...'}
            </div>
          )}
        </div>

        <BallHistory balls={ballHistory} />
      </div>
    </div>
  );
}
