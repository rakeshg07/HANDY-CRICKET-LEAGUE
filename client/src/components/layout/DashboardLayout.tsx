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
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-2.5 h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1">Dashboard</h2>
          {leftNav.map((item) => {
            const isActive = screen === item.target;
            return (
              <button
                key={item.label}
                onClick={() => { sounds.click(); setScreen(item.target); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                  isActive
                    ? 'bg-stadium-green/20 border-stadium-green text-stadium-green shadow-neon-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-1 lg:col-span-6 flex flex-col pt-2 lg:pt-0 pb-16 lg:pb-0 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-1">
          {children}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-2.5 h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1">Play & Learn</h2>
          {rightNav.map((item) => (
            <button
              key={item.label}
              onClick={() => { sounds.click(); item.action(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                item.primary
                  ? 'bg-stadium-green/10 border-stadium-green/30 text-stadium-green hover:bg-stadium-green/20 hover:border-stadium-green/50 shadow-neon-sm font-bold'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}

          <div className="mt-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">Recent Matches</h2>
            <GlassCard className="p-3 border border-white/5 text-center text-xs text-gray-500 bg-black/20">
              No recent matches found.
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 lg:hidden pb-safe">
        <div className="flex items-center justify-around p-2">
          {leftNav.slice(0, 3).map((item) => {
            const isActive = screen === item.target;
            return (
              <button
                key={item.label}
                onClick={() => { sounds.click(); setScreen(item.target); }}
                className={`flex flex-col items-center gap-1 p-2 min-w-[4rem] rounded-xl transition-all ${
                  isActive
                    ? 'text-stadium-green'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
          
          {/* Quick Play Mobile Button */}
          <button
            onClick={() => { sounds.click(); setScreen('test-match'); }}
            className="flex flex-col items-center justify-center gap-1 min-w-[4.5rem] -mt-6 relative group"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-stadium-green to-emerald-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] border-4 border-[#121212] group-active:scale-95 transition-transform">
              🏏
            </div>
            <span className="text-[10px] font-bold text-stadium-green mt-1">Play</span>
          </button>

          {/* Multiplayer Mobile Dropdown (simplified as Join for now) */}
          <button
            onClick={() => { sounds.click(); setJoinOpen(true); }}
            className="flex flex-col items-center gap-1 p-2 min-w-[4rem] rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold">Join</span>
          </button>
        </div>
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
