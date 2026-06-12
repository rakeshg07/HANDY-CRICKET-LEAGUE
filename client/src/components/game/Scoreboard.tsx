'use client';

import { Scoreboard as ScoreboardType, Ball, HAND_EMOJIS } from '@hcl/shared';
import { formatOvers } from '@hcl/shared';
import { GlassCard } from '@/components/ui/GlassCard';

interface ScoreboardProps {
  scoreboard: ScoreboardType;
  totalOvers: number;
  recentBalls: Ball[];
}

export function Scoreboard({ scoreboard, totalOvers, recentBalls }: ScoreboardProps) {
  const { battingTeam, currentBatsman, currentBowler, partnership, target, requiredRunRate } = scoreboard;

  const runsNeeded = target ? target - battingTeam.runs : null;
  const totalBalls = totalOvers * 6;
  const ballsBowled = battingTeam.overs * 6 + battingTeam.balls;
  const ballsRemaining = Math.max(0, totalBalls - ballsBowled);

  return (
    <GlassCard className="space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-stadium-green font-bold text-lg uppercase tracking-wider">{battingTeam.teamName}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight">{battingTeam.runs}</span>
            <span className="text-2xl text-gray-400 font-bold">/ {battingTeam.wickets}</span>
          </div>
          <p className="text-gray-300 text-sm font-medium mt-1">
            <span className="text-white">{formatOvers(battingTeam.overs, battingTeam.balls)}</span> Overs
            <span className="mx-3 text-gray-600">|</span>
            RR: <span className="text-white">{battingTeam.runRate}</span>
          </p>
        </div>

        {target && (
          <div className="text-right bg-stadium-green/10 p-3 rounded-xl border border-stadium-green/20">
            <p className="text-xs text-stadium-green uppercase font-bold tracking-wider mb-1">Target: {target}</p>
            {runsNeeded !== null && runsNeeded > 0 ? (
              <>
                <p className="text-lg font-black text-white">Need {runsNeeded} Runs</p>
                <p className="text-sm text-gray-300">in {ballsRemaining} balls</p>
              </>
            ) : (
              <p className="text-lg font-black text-white">Target Reached!</p>
            )}
            {requiredRunRate !== undefined && (
              <p className="text-xs text-stadium-green mt-1">RRR: {requiredRunRate}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
        {currentBatsman && (
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Batter</p>
            <p className="font-semibold text-white">{currentBatsman.playerName} <span className="text-stadium-green">*</span></p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{currentBatsman.runs}</span> ({currentBatsman.ballsFaced})
              <span className="ml-2 text-xs">SR: {currentBatsman.strikeRate}</span>
            </p>
          </div>
        )}

        {currentBowler && (
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Bowler</p>
            <p className="font-semibold text-white">{currentBowler.playerName}</p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{currentBowler.wickets}</span>/{currentBowler.runsConceded}
              <span className="ml-2 text-xs">Econ: {currentBowler.economy}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-400">
        <div>
          Partnership: <span className="text-white font-medium">{partnership.runs}</span> ({partnership.balls})
        </div>
      </div>

      {recentBalls.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Recent</p>
          <div className="flex gap-2">
            {recentBalls.map((ball) => (
              <div
                key={ball.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                  ball.isWicket ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'
                }`}
              >
                {ball.isWicket ? (
                  'OUT'
                ) : (
                  <>
                    <span className="text-[10px]">{HAND_EMOJIS[ball.batsmanChoice]}</span> {ball.runs}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
