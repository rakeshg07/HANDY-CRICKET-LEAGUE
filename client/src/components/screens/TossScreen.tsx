'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { sounds } from '@/lib/sounds';

export function TossScreen() {
  const { match, playerId, tossWinner } = useGameStore();
  const { coinToss, inningsDecision } = useSocket();
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasTossed, setHasTossed] = useState(false);

  const isWinner = tossWinner?.id === playerId;

  const handleToss = (choice: 'heads' | 'tails') => {
    sounds.toss();
    setIsFlipping(true);
    setHasTossed(true);
    coinToss(choice);
    setTimeout(() => setIsFlipping(false), 3000);
  };

  const handleDecision = (choice: 'bat' | 'bowl') => {
    sounds.click();
    inningsDecision(choice);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <GlassCard className="w-full max-w-md text-center" strong>
        <h1 className="text-3xl font-black mb-2">Coin Toss</h1>
        <p className="text-gray-400 mb-8">
          {match?.settings.matchName ?? 'Match'} — {match?.settings.overs === 9999 ? 'Unlimited' : match?.settings.overs} Overs
        </p>

        <AnimatePresence mode="wait">
          {!tossWinner && (
            <motion.div key="toss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={isFlipping ? { rotateY: [0, 1800] } : {}}
                transition={{ duration: 3 }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-5xl shadow-neon"
              >
                🪙
              </motion.div>

              {!hasTossed && (
                <div className="space-y-3">
                  <p className="text-gray-400 mb-4">Call the toss!</p>
                  <button onClick={() => handleToss('heads')} className="btn-primary w-full">
                    Heads
                  </button>
                  <button onClick={() => handleToss('tails')} className="btn-secondary w-full">
                    Tails
                  </button>
                </div>
              )}

              {hasTossed && isFlipping && (
                <p className="text-stadium-green animate-pulse">Flipping coin...</p>
              )}
            </motion.div>
          )}

          {tossWinner && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-xl font-bold text-stadium-green mb-2">{tossWinner.name} won the toss!</p>

              {isWinner ? (
                <div className="space-y-3 mt-6">
                  <p className="text-gray-400">Choose what to do:</p>
                  <button onClick={() => handleDecision('bat')} className="btn-primary w-full">
                    🏏 Bat First
                  </button>
                  <button onClick={() => handleDecision('bowl')} className="btn-secondary w-full">
                    🎯 Bowl First
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 mt-4">Waiting for toss winner to decide...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
