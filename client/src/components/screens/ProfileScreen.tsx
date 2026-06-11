'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useProfileStore } from '@/store/profileStore';
import { AVATAR_OPTIONS, COUNTRY_OPTIONS } from '@/lib/profileStorage';

export function ProfileScreen() {
  const { profile, hydrated, hydrate, updateProfile, winPercentage } = useProfileStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-black text-center">Player Profile</h1>

      <GlassCard strong className="text-center">
        <div className="relative inline-block mb-4">
          <div className="text-7xl">{profile.avatar}</div>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                onClick={() => updateProfile({ avatar: av })}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  profile.avatar === av ? 'bg-stadium-green/30 ring-2 ring-stadium-green' : 'hover:bg-white/10'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <input
          className="input-field text-center text-xl font-bold mb-3"
          value={profile.name}
          onChange={(e) => updateProfile({ name: e.target.value })}
        />

        <select
          className="input-field text-center"
          value={profile.country}
          onChange={(e) => updateProfile({ country: e.target.value })}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="mt-4 inline-block px-4 py-1 bg-stadium-green/20 text-stadium-green rounded-full text-sm font-bold">
          Rank: {profile.rank}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Matches', value: profile.matchesPlayed },
          { label: 'Wins', value: profile.wins },
          { label: 'Losses', value: profile.losses },
          { label: 'Win %', value: `${winPercentage()}%` },
          { label: 'Total Runs', value: profile.totalRuns },
          { label: 'High Score', value: profile.highestScore },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-4 rounded-xl text-center"
          >
            <p className="text-2xl font-black text-stadium-green">{stat.value}</p>
            <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-bold text-stadium-green mb-3">Recent Matches</h3>
        {profile.recentMatches.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No matches played yet. Try Test Match mode!</p>
        ) : (
          <div className="space-y-2">
            {profile.recentMatches.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-2 glass rounded-lg text-sm">
                <span>vs {m.opponent}</span>
                <span className={m.result === 'win' ? 'text-stadium-green' : m.result === 'loss' ? 'text-red-400' : 'text-yellow-400'}>
                  {m.result.toUpperCase()}
                </span>
                <span className="text-gray-500">{m.score}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
