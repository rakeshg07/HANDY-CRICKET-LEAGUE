'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreateRoomModal } from '@/components/modals/CreateRoomModal';
import { JoinRoomModal } from '@/components/modals/JoinRoomModal';
import { useGameStore, GameScreen } from '@/store/gameStore';
import { sounds } from '@/lib/sounds';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { setScreen, screen } = useGameStore();

  const leftNav: { icon: string; label: string; target: GameScreen }[] = [
    { icon: '👤', label: 'Profile', target: 'profile' },
    { icon: '📜', label: 'Match History', target: 'history' },
    { icon: '👥', label: 'Friends', target: 'friends' },
    { icon: '🏆', label: 'Leaderboards', target: 'leaderboard' },
  ];

  const rightNav = [
    { icon: '➕', label: 'Create Room', action: () => setCreateOpen(true), primary: true },
    { icon: '🚪', label: 'Join Room', action: () => setJoinOpen(true), primary: true },
    { icon: '🥇', label: 'Tournaments', action: () => alert('Coming Soon!') },
    { icon: '🧪', label: 'Test Multiplayer', action: () => setScreen('test-match') },
  ];

  return (
    <div className="min-h-[calc(100vh-3rem)] relative overflow-hidden flex flex-col p-3 sm:p-5 md:p-6">
      {/* Animated Stadium Background Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('/stadium-bg.jpg')] bg-cover bg-center opacity-20 fixed" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-stadium-dark/80 via-transparent to-stadium-dark fixed" />

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 h-full flex-1 max-w-6xl mx-auto w-full">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          <GlassCard className="h-[calc(100vh-6rem)]" strong>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dashboard</h2>
            <div className="space-y-1.5">
              {leftNav.map((item) => {
                const isActive = screen === item.target;
                return (
                  <button
                    key={item.label}
                    onClick={() => { sounds.click(); setScreen(item.target); }}
                    className={`w-full flex items-center gap-3 p-2 sm:p-2.5 rounded-xl transition-colors text-left ${
                      isActive ? 'bg-stadium-green/20 text-stadium-green' : 'hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-1 lg:col-span-6 flex flex-col pt-2 lg:pt-0 pb-16 lg:pb-0 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-1">
          {children}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          <GlassCard className="h-[calc(100vh-6rem)]" strong>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Play & Learn</h2>
            <div className="space-y-2">
              {rightNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { sounds.click(); item.action(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    item.primary
                      ? 'bg-white/10 hover:bg-stadium-green/20 hover:text-stadium-green border border-white/5 hover:border-stadium-green/30'
                      : 'hover:bg-white/10 text-gray-200'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Matches</h2>
              <div className="p-3 bg-black/20 rounded-xl text-xs text-gray-500 text-center">
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
