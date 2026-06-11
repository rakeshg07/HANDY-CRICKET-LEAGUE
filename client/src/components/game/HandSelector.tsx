'use client';

import { HandNumber, PlayerMatchState } from '@hcl/shared';
import { HAND_NUMBERS } from '@hcl/shared';
import { HandButton } from '@/components/ui/HandButton';
import { motion } from 'framer-motion';

interface HandSelectorProps {
  onSelect: (number: HandNumber) => void;
  disabled?: boolean;
  submitted?: boolean;
  role: PlayerMatchState | 'BATTING' | 'BOWLING' | null;
  movesReceived?: number;
  batsmanName?: string;
  bowlerName?: string;
}

export function HandSelector({
  onSelect,
  disabled,
  submitted,
  role,
  movesReceived = 0,
  batsmanName,
  bowlerName,
}: HandSelectorProps) {
  const canBat = role === 'BATTING';
  const canBowl = role === 'BOWLING';

  if (!canBat && !canBowl) {
    const message =
      role === 'OUT'
        ? 'You are out — waiting for your team'
        : role === 'WAITING'
          ? 'You are next to bat — get ready!'
          : `Watching ${batsmanName ?? 'batter'} vs ${bowlerName ?? 'bowler'}`;

    return (
      <div className="text-center py-8 space-y-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-400"
        >
          {message}
        </motion.div>
        {movesReceived > 0 && (
          <p className="text-xs text-stadium-green">
            {movesReceived}/2 players have submitted their move
          </p>
        )}
        <p className="text-xs text-gray-600 uppercase tracking-widest">Spectating</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-stadium-green font-semibold uppercase tracking-wider">
        {canBat ? '🏏 Your Turn — Choose Your Shot' : '🎯 Your Turn — Choose Your Bowl'}
      </p>

      {submitted ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-400">Move submitted — hidden from opponents</p>
          <p className="text-xs text-gray-500 mt-2">
            Waiting for {canBat ? bowlerName ?? 'bowler' : batsmanName ?? 'batter'}...
            {movesReceived > 0 && ` (${movesReceived}/2)`}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 justify-items-center">
          {HAND_NUMBERS.map((num) => (
            <HandButton
              key={num}
              number={num}
              disabled={disabled}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
