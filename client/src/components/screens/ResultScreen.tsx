'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Confetti } from '@/components/ui/Confetti';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { formatOvers } from '@hcl/shared';
import { useEffect } from 'react';

export function ResultScreen() {
  const { matchEnd, reset, setScreen, room } = useGameStore();
  const recordMatch = useProfileStore((s) => s.recordMatch);

  useEffect(() => {
    if (matchEnd && !matchEnd.isDraw) {
      const myTeam = room?.teams.find((t) => t.playerIds.includes(useGameStore.getState().playerId ?? ''));
      const won = matchEnd.winnerId === myTeam?.id;
      recordMatch(
        won ? 'win' : 'loss',
        matchEnd.teamAScore.runs,
        matchEnd.teamBScore.teamName,
        `${matchEnd.teamAScore.runs}/${matchEnd.teamAScore.wickets}`
      );
    }
  }, [matchEnd, room, recordMatch]);

  if (!matchEnd) return null;

  const { winnerName, teamAScore, teamBScore, isDraw } = matchEnd;
  const margin = Math.abs(teamAScore.runs - teamBScore.runs);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {!isDraw && <Confetti />}

      <GlassCard className="w-full max-w-lg text-center" strong>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="text-6xl mb-4">{isDraw ? '🤝' : '🏆'}</div>

          {isDraw ? (
            <h1 className="text-3xl font-black text-yellow-400 mb-2">DRAW!</h1>
          ) : (
            <>
              <h1 className="text-3xl font-black text-stadium-green mb-1">{winnerName}</h1>
              <p className="text-gray-400 mb-1">wins the match!</p>
              <p className="text-stadium-green-glow font-bold">by {margin} runs</p>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="glass p-4 rounded-xl">
              <p className="text-sm text-gray-400">{teamAScore.teamName}</p>
              <p className="text-3xl font-black">
                {teamAScore.runs}/{teamAScore.wickets}
              </p>
              <p className="text-xs text-gray-500">
                {formatOvers(teamAScore.overs, teamAScore.balls)} overs • RR {teamAScore.runRate}
              </p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-sm text-gray-400">{teamBScore.teamName}</p>
              <p className="text-3xl font-black">
                {teamBScore.runs}/{teamBScore.wickets}
              </p>
              <p className="text-xs text-gray-500">
                {formatOvers(teamBScore.overs, teamBScore.balls)} overs • RR {teamBScore.runRate}
              </p>
            </div>
          </div>

          {isDraw && (
            <p className="text-yellow-400 text-sm mb-4">Super Over mode available in future update</p>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-primary flex-1">
              Play Again
            </button>
            <button onClick={() => { reset(); setScreen('home'); }} className="btn-secondary flex-1">
              Back to Home
            </button>
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
