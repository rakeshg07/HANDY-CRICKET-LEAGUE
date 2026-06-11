'use client';

import { Scoreboard as ScoreboardType } from '@hcl/shared';
import { formatOvers } from '@hcl/shared';
import { GlassCard } from '@/components/ui/GlassCard';

interface ScoreboardProps {
  scoreboard: ScoreboardType;
}

export function Scoreboard({ scoreboard }: ScoreboardProps) {
  const { battingTeam, currentBatsman, currentBowler, partnership, target, requiredRunRate } = scoreboard;

  return (
    <GlassCard className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-stadium-green font-bold text-lg">{battingTeam.teamName}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">{battingTeam.runs}</span>
            <span className="text-xl text-gray-400">/ {battingTeam.wickets}</span>
          </div>
          <p className="text-gray-400 text-sm">
            {formatOvers(battingTeam.overs, battingTeam.balls)} Overs
            <span className="ml-3">RR: {battingTeam.runRate}</span>
          </p>
        </div>

        {target && (
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">Target</p>
            <p className="text-2xl font-bold text-stadium-green">{target}</p>
            {requiredRunRate !== undefined && (
              <p className="text-xs text-gray-400">RRR: {requiredRunRate}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        {currentBatsman && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Batter</p>
            <p className="font-semibold">{currentBatsman.playerName} *</p>
            <p className="text-sm text-gray-400">
              {currentBatsman.runs} ({currentBatsman.ballsFaced})
              <span className="ml-2">SR: {currentBatsman.strikeRate}</span>
            </p>
          </div>
        )}

        {currentBowler && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Bowler</p>
            <p className="font-semibold">{currentBowler.playerName}</p>
            <p className="text-sm text-gray-400">
              {currentBowler.wickets}/{currentBowler.runsConceded}
              <span className="ml-2">Econ: {currentBowler.economy}</span>
            </p>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        Partnership: {partnership.runs} ({partnership.balls})
      </div>
    </GlassCard>
  );
}
