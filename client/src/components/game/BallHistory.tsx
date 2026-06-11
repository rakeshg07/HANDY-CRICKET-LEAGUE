'use client';

import { Ball } from '@hcl/shared';
import { HAND_EMOJIS } from '@hcl/shared';
import { GlassCard } from '@/components/ui/GlassCard';

interface BallHistoryProps {
  balls: Ball[];
}

export function BallHistory({ balls }: BallHistoryProps) {
  if (balls.length === 0) return null;

  return (
    <GlassCard className="max-h-48 overflow-y-auto">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Ball History
      </h4>
      <div className="space-y-2">
        {balls.slice().reverse().map((ball, i) => (
          <div
            key={ball.id}
            className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0"
          >
            <span className="text-gray-500 w-16">
              {ball.overNumber}.{ball.ballNumber}
            </span>
            <span>
              {HAND_EMOJIS[ball.bowlerChoice]} vs {HAND_EMOJIS[ball.batsmanChoice]}
            </span>
            <span className={ball.isWicket ? 'text-red-400 font-bold' : 'text-stadium-green'}>
              {ball.isWicket ? 'OUT' : `+${ball.runs}`}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
