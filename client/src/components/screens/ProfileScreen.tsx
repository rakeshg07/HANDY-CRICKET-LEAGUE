'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { sounds } from '@/lib/sounds';

export function ProfileScreen() {
  const { user } = useAuthStore();
  const { profile, hydrated, hydrate } = useProfileStore();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!user) {
    return <div className="p-8 text-center text-gray-400">Loading user profile...</div>;
  }

  // Calculate Win %
  const totalMatches = user.matchesPlayed || 0;
  const wins = user.wins || 0;
  const losses = user.losses || 0;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Determine Professional Tier based on ELO
  const elo = user.rank || 1000;
  let tier = 'Rookie';
  let tierColor = 'text-gray-400 border-gray-500/30 bg-gray-500/10';
  if (elo >= 1800) {
    tier = 'Grandmaster Legend';
    tierColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  } else if (elo >= 1500) {
    tier = 'Master Class';
    tierColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
  } else if (elo >= 1200) {
    tier = 'All-Rounder Pro';
    tierColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (elo >= 1050) {
    tier = 'Challenger';
    tierColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Top Banner / Card */}
      <GlassCard strong className="relative overflow-hidden p-6 sm:p-8 flex flex-col items-center sm:flex-row sm:items-start gap-6 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-stadium-green/5 to-transparent pointer-events-none" />
        
        {/* Glowing Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:sm:h-28 bg-gradient-to-br from-stadium-green to-emerald-500 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-white/20 relative z-10 transition-transform group-hover:scale-105 duration-300">
            {user.avatar || '🏏'}
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-stadium-green to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-3xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                {user.fullName}
              </h2>
              <span className={`inline-block text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${tierColor}`}>
                {tier}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-400 font-mono mt-1">@{user.userId}</p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400">
            <span>📍 {user.country || 'India'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-stadium-green font-bold">Online & Registered</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { sounds.click(); setEditOpen(true); }}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-200 font-bold rounded-xl text-sm hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center gap-2 mx-auto sm:mx-0 shadow-lg"
            >
              ⚙️ Edit Game Profile
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rating ELO', value: `🏆 ${elo}` },
          { label: 'Matches', value: totalMatches },
          { label: 'Wins', value: wins },
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Losses', value: losses },
          { label: 'Total Runs', value: user.totalRuns || 0 },
          { label: 'High Score', value: user.highestScore || 0 },
          { label: 'Account Created', value: new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-4 rounded-xl text-center flex flex-col justify-center border border-white/5 hover:border-white/10 transition-colors"
          >
            <p className="text-xl sm:text-2xl font-black text-stadium-green">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Career Logs */}
      <GlassCard className="border border-white/5">
        <h3 className="font-bold text-stadium-green mb-3 flex items-center gap-2">
          <span>📜</span> Recent Offline Matches
        </h3>
        {hydrated && profile.recentMatches.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No offline matches played yet. Try Quick Play mode!</p>
        ) : (
          <div className="space-y-2">
            {hydrated && profile.recentMatches.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-3 glass rounded-xl text-sm hover:bg-white/5 transition-colors border border-white/5">
                <span className="font-semibold text-gray-300">vs {m.opponent}</span>
                <span className={`font-black uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                  m.result === 'win'
                    ? 'bg-stadium-green/10 text-stadium-green border border-stadium-green/20'
                    : m.result === 'loss'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {m.result}
                </span>
                <span className="text-gray-400 font-mono">{m.score}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
