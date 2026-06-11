'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BallResultEvent } from '@hcl/shared';
import { HAND_EMOJIS } from '@hcl/shared';
import { HandButton } from '@/components/ui/HandButton';

interface BallRevealProps {
  result: BallResultEvent | null;
}

export function BallReveal({ result }: BallRevealProps) {
  if (!result) return null;

  const { ball, isWicket } = result;

  return (
    <AnimatePresence>
      <motion.div
        key={ball.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong p-8 max-w-sm w-full mx-4 text-center"
        >
          <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Ball Reveal</p>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Bowler</p>
              <HandButton number={ball.bowlerChoice} size="lg" disabled />
            </div>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-stadium-green"
            >
              VS
            </motion.span>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Batsman</p>
              <HandButton number={ball.batsmanChoice} size="lg" disabled />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isWicket ? (
              <div className="text-red-500 text-4xl font-black animate-pulse">OUT!</div>
            ) : (
              <div className="score-popup">+{ball.runs} Runs</div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
