'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

type FilterType = 'all' | 'win' | 'loss' | 'draw';

export function MatchHistoryScreen() {
  const { user } = useAuthStore();
  const { profile, hydrated, hydrate } = useProfileStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const totalMatches = user?.matchesPlayed || 0;
  const wins = user?.wins || 0;
  const losses = user?.losses || 0;
  const draws = Math.max(0, totalMatches - wins - losses);
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const matches = hydrated ? profile.recentMatches : [];
  const filteredMatches = filter === 'all' ? matches : matches.filter(m => m.result === filter);

  const filterButtons: { label: string; value: FilterType; color: string; count: number }[] = [
    { label: 'All', value: 'all', color: 'text-white border-white/20 bg-white/5', count: matches.length },
    { label: 'Wins', value: 'win', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', count: matches.filter(m => m.result === 'win').length },
    { label: 'Losses', value: 'loss', color: 'text-red-400 border-red-500/30 bg-red-500/10', count: matches.filter(m => m.result === 'loss').length },
    { label: 'Draws', value: 'draw', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', count: matches.filter(m => m.result === 'draw').length },
  ];

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆';
      case 'loss': return '💔';
      case 'draw': return '🤝';
      default: return '🏏';
    }
  };

  const getResultStyle = (result: string) => {
    switch (result) {
      case 'win': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'loss': return 'bg-red-500/15 border-red-500/30 text-red-400';
      case 'draw': return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      default: return 'bg-white/5 border-white/10 text-gray-400';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Match History
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Your recent offline match records</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-stadium-green font-black text-lg">{totalMatches}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Win Rate', value: `${winRate}%`, color: 'from-emerald-500/20 to-emerald-500/5', textColor: 'text-emerald-400' },
          { label: 'Wins', value: wins, color: 'from-green-500/20 to-green-500/5', textColor: 'text-green-400' },
          { label: 'Losses', value: losses, color: 'from-red-500/20 to-red-500/5', textColor: 'text-red-400' },
          { label: 'Draws', value: draws, color: 'from-amber-500/20 to-amber-500/5', textColor: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-xl bg-gradient-to-b ${stat.color} border border-white/5 text-center`}
          >
            <p className={`text-xl font-black ${stat.textColor}`}>{stat.value}</p>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              filter === btn.value
                ? `${btn.color} shadow-lg scale-[1.02]`
                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* Match List */}
      <GlassCard className="border border-white/5 !p-3">
        <AnimatePresence mode="wait">
          {filteredMatches.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 text-sm font-semibold">
                {filter === 'all' ? 'No matches played yet' : `No ${filter} matches found`}
              </p>
              <p className="text-gray-600 text-xs mt-1">Play a Quick Play match to start your journey!</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredMatches.map((match, i) => (
                <motion.div
                  key={`${match.opponent}-${match.date}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-default ${getResultStyle(match.result)}`}
                >
                  {/* Result Icon */}
                  <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-xl flex-shrink-0">
                    {getResultIcon(match.result)}
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">vs {match.opponent}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getResultStyle(match.result)}`}>
                        {match.result}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{match.date}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-black text-sm text-white">{match.score}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
