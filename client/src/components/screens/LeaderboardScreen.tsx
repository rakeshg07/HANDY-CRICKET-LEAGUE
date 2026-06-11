'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';

const PLACEHOLDER_LEADERBOARD = [
  { rank: 1, name: 'CricketKing', wins: 42, matches: 50 },
  { rank: 2, name: 'HandMaster', wins: 38, matches: 45 },
  { rank: 3, name: 'SixHitter', wins: 35, matches: 48 },
  { rank: 4, name: 'BowlWizard', wins: 30, matches: 40 },
  { rank: 5, name: 'PitchLord', wins: 28, matches: 42 },
];

export function LeaderboardScreen() {
  const { setScreen } = useGameStore();

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-black text-center">Leaderboard</h1>
        <p className="text-center text-gray-500 text-sm">Coming Soon</p>

        <GlassCard>
          <div className="space-y-3">
            {PLACEHOLDER_LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-3 glass rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                      entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-gray-500'}`}>
                    {entry.rank}
                  </span>
                  <span className="font-medium">{entry.name}</span>
                </div>
                <span className="text-stadium-green text-sm">{entry.wins}W / {entry.matches}M</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <button onClick={() => setScreen('home')} className="btn-secondary w-full">
          Back to Home
        </button>
      </div>
    </div>
  );
}
