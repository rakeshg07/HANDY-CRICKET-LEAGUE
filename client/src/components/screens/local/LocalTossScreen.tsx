'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useLocalGameStore, submitLocalInningsChoice } from '@/store/localGameStore';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';

export function LocalTossScreen() {
  const {
    performToss,
    userTossChoice,
    userPlayerId,
    tossWinnerId,
    tossDecision,
    aiProfile,
    liveState,
  } = useLocalGameStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const [flipping, setFlipping] = useState(false);

  const handleToss = (choice: 'heads' | 'tails') => {
    setFlipping(true);
    // Show coin animation for 1.5s then reveal result
    setTimeout(() => {
      performToss(choice);
      setFlipping(false);
    }, 1500);
  };

  const userWonToss = tossWinnerId === userPlayerId;
  const tossResolved = tossWinnerId !== null;
  const matchReady = liveState?.ballPhase === 'waiting-moves';

  // Auto-navigate to match when liveState is ready (AI won toss path)
  useEffect(() => {
    if (matchReady && tossDecision && !userWonToss) {
      const t = setTimeout(() => setGameScreen('local-match'), 2000);
      return () => clearTimeout(t);
    }
  }, [matchReady, tossDecision, userWonToss, setGameScreen]);

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">The Toss</h1>
        <p className="text-blue-200/80">
          You vs {aiProfile?.avatar} {aiProfile?.name}
        </p>
      </div>

      <GlassCard className="p-8 text-center space-y-8">
        {/* Step 1: Choose heads or tails */}
        {!userTossChoice && !flipping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="text-xl font-medium text-white/90">Call the coin</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleToss('heads')}
                className="p-6 rounded-2xl bg-white/5 border-2 border-transparent hover:border-blue-400 hover:bg-white/10 transition-all space-y-2"
              >
                <div className="text-5xl">🪙</div>
                <div className="font-bold text-white text-lg">Heads</div>
              </button>
              <button
                onClick={() => handleToss('tails')}
                className="p-6 rounded-2xl bg-white/5 border-2 border-transparent hover:border-blue-400 hover:bg-white/10 transition-all space-y-2"
              >
                <div className="text-5xl">🪙</div>
                <div className="font-bold text-white text-lg">Tails</div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Coin flipping animation */}
        {flipping && (
          <div className="py-12 space-y-4">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-7xl inline-block"
            >
              🪙
            </motion.div>
            <p className="text-xl font-bold text-white animate-pulse">Flipping...</p>
          </div>
        )}

        {/* Step 3: Toss result */}
        {tossResolved && !flipping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="space-y-6"
          >
            {userWonToss ? (
              <>
                <div className="text-5xl">🎉</div>
                <p className="text-2xl font-black text-green-400">You won the toss!</p>
                {!tossDecision && (
                  <div className="space-y-4">
                    <p className="text-white/80">What do you want to do?</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => {
                          submitLocalInningsChoice('bat');
                          setGameScreen('local-match');
                        }}
                        size="lg"
                        className="px-8"
                      >
                        🏏 Bat First
                      </Button>
                      <Button
                        onClick={() => {
                          submitLocalInningsChoice('bowl');
                          setGameScreen('local-match');
                        }}
                        size="lg"
                        variant="outline"
                        className="px-8"
                      >
                        ⚾ Bowl First
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-5xl">{aiProfile?.avatar}</div>
                <p className="text-2xl font-black text-red-400">
                  {aiProfile?.name} won the toss!
                </p>
                {tossDecision ? (
                  <div className="space-y-4">
                    <p className="text-lg text-white/90">
                      They chose to <span className="font-bold text-blue-400 uppercase">{tossDecision}</span> first.
                    </p>
                    {matchReady && (
                      <p className="text-sm text-white/50 animate-pulse">Starting match...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-white/70 animate-pulse">Deciding...</p>
                )}
              </>
            )}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
