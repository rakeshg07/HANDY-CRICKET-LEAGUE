'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreateRoomModal } from '@/components/modals/CreateRoomModal';
import { JoinRoomModal } from '@/components/modals/JoinRoomModal';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { sounds } from '@/lib/sounds';

export function HomeScreen() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { error, setError, setScreen } = useGameStore();
  const profile = useProfileStore((s) => s.profile);

  const leftNav = [
    { icon: '👤', label: 'Profile', action: () => setScreen('profile') },
    { icon: '📊', label: 'Statistics', action: () => setScreen('profile') },
    { icon: '📜', label: 'Match History', action: () => setScreen('profile') },
    { icon: '👥', label: 'Friends', action: () => setScreen('profile') },
    { icon: '🏆', label: 'Leaderboards', action: () => setScreen('leaderboard') },
    { icon: '⚙️', label: 'Settings', action: () => setScreen('settings') },
  ];

  const rightNav = [
    { icon: '➕', label: 'Create Room', action: () => setCreateOpen(true), primary: true },
    { icon: '🚪', label: 'Join Room', action: () => setJoinOpen(true), primary: true },
    { icon: '🥇', label: 'Tournaments', action: () => alert('Coming Soon!') },
    { icon: '🧪', label: 'Test Multiplayer', action: () => setScreen('test-match') },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col p-4 sm:p-8">
      {/* Animated Stadium Background Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('/stadium-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-stadium-dark/80 via-transparent to-stadium-dark" />

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 max-w-7xl mx-auto w-full">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <GlassCard className="h-full" strong>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Dashboard</h2>
            <div className="space-y-2">
              {leftNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { sounds.click(); item.action(); }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-gray-200">{item.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CENTER PANEL */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center gap-8 py-8 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-8xl mb-6 drop-shadow-2xl"
            >
              🏏
            </motion.div>
            <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-br from-stadium-green via-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-lg mb-2">
              HCL
            </h1>
            <p className="text-xl font-medium text-emerald-100/70 tracking-widest uppercase">
              Handy Cricket League
            </p>
          </motion.div>

          <GlassCard className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10">
            {profile.name ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/20">
                  {profile.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1 text-sm text-stadium-green font-medium">
                    <span className="w-2 h-2 rounded-full bg-stadium-green animate-pulse" />
                    Online & Ready
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <h3 className="text-xl text-gray-400">Welcome Guest</h3>
                <p className="text-sm mt-2 text-gray-500">Set up your profile to save stats.</p>
              </div>
            )}
          </GlassCard>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex justify-between items-center shadow-lg">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-white transition-colors">✕</button>
            </motion.div>
          )}

          <button
            onClick={() => { sounds.click(); setScreen('local-config'); }}
            className="w-full max-w-md py-5 rounded-2xl font-black text-2xl bg-gradient-to-r from-stadium-green to-emerald-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            ⚡ QUICK PLAY
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <GlassCard className="h-full" strong>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Play & Learn</h2>
            <div className="space-y-3">
              {rightNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { sounds.click(); item.action(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                    item.primary
                      ? 'bg-white/10 hover:bg-white/20 border border-white/5'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-gray-100">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Recent Matches</h3>
              <div className="p-4 rounded-xl bg-black/20 text-center text-sm text-gray-500 border border-white/5">
                No recent matches found.
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
