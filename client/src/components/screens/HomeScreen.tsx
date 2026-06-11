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

  const navCards = [
    { icon: '👤', label: 'Profile', screen: 'profile' as const },
    { icon: '📖', label: 'Rules', screen: 'rules' as const },
    { icon: '🧪', label: 'Multiplayer Test', screen: 'test-match' as const },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-7xl mb-4"
        >
          🏏
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-stadium-green via-stadium-green-glow to-emerald-400 bg-clip-text text-transparent">
          Handy Cricket League
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Real-time Multiplayer Hand Cricket</p>
        {profile.name && (
          <p className="text-sm text-stadium-green mt-2">
            Welcome back, {profile.avatar} {profile.name}
          </p>
        )}
      </motion.div>

      <GlassCard className="w-full max-w-md mb-6" strong>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => { sounds.click(); setCreateOpen(true); }}
            className="btn-primary w-full text-lg py-4"
          >
            Create Room
          </button>
          <button
            onClick={() => { sounds.click(); setJoinOpen(true); }}
            className="btn-secondary w-full text-lg py-4"
          >
            Join Room
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {navCards.map((card, i) => (
          <motion.button
            key={card.screen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => { sounds.click(); setScreen(card.screen); }}
            className="glass p-4 rounded-xl text-center hover:bg-white/10 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-1">{card.icon}</div>
            <div className="text-xs font-medium text-gray-300">{card.label}</div>
          </motion.button>
        ))}
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
