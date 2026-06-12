'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { sounds } from '@/lib/sounds';

export function LobbyScreen() {
  const { room, playerId, setScreen, error } = useGameStore();
  const { toggleReady, startMatch } = useSocket();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const allReady = room.players.every((p) => p.isReady);
  const canStart = isHost && allReady && room.players.length >= 2;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      sounds.click();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleReady = () => {
    sounds.click();
    toggleReady(!me?.isReady);
  };

  const handleStart = () => {
    sounds.click();
    startMatch();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setScreen('home')} className="text-sm text-gray-500 hover:text-stadium-green mb-4">
          ← Back to Home
        </button>
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
        <h1 className="text-3xl font-black text-center mb-2">Room Lobby</h1>
        <div className="text-center">
          <span className="text-gray-400 text-sm">Room Code</span>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="text-4xl font-mono font-black text-stadium-green tracking-[0.3em]">
              {room.code}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 glass rounded-lg text-sm hover:bg-white/10"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </motion.div>

      <GlassCard strong>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-stadium-green">
            Players ({room.players.length}/{room.maxPlayers})
          </h2>
          <span className="text-xs px-2 py-1 glass rounded-full text-gray-400 uppercase">
            {room.status === 'waiting' ? '⏳ Waiting' : room.status}
          </span>
        </div>

        <div className="space-y-2">
          {room.players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 glass rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stadium-green/20 flex items-center justify-center text-sm font-bold">
                  {player.name[0].toUpperCase()}
                </div>
                <span className="font-medium">
                  {player.name}
                  {player.isHost && <span className="ml-2 text-xs text-yellow-400">HOST</span>}
                </span>
              </div>
              <span className={`text-sm ${player.isReady ? 'text-stadium-green' : 'text-gray-500'}`}>
                {player.isReady ? '✅ Ready' : '⏳ Waiting'}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleReady}
          className={me?.isReady ? 'btn-secondary w-full' : 'btn-primary w-full'}
        >
          {me?.isReady ? 'Cancel Ready' : 'Ready Up!'}
        </button>

        {isHost && (
          <>
            <button onClick={() => setScreen('teams')} className="btn-secondary w-full">
              Team Selection
            </button>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                canStart ? 'btn-primary' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canStart ? 'Start Match' : `Waiting (${room.players.filter((p) => p.isReady).length}/${room.players.length} ready)`}
            </button>
          </>
        )}

        {!isHost && !me?.isReady && (
          <p className="text-center text-sm text-gray-500">Waiting for host to start the match...</p>
        )}
      </div>
    </div>
  );
}
