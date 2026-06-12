'use client';

import { useGameStore, GameScreen } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';

export function Header() {
  const { setScreen, isConnected } = useGameStore();
  const { developerMode } = useSettingsStore();

  const navigate = (s: GameScreen) => {
    setScreen(s);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-stadium-border/50">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-black text-lg hover:text-stadium-green transition-colors"
        >
          <span className="text-2xl">🏏</span>
          <span className="hidden sm:inline bg-gradient-to-r from-stadium-green to-stadium-green-glow bg-clip-text text-transparent">
            HCL
          </span>
        </button>

        <div className="flex items-center gap-3">
          {developerMode && (
            <span className="hidden sm:inline text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
              DEV
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-stadium-green animate-pulse' : 'bg-gray-500'}`}
            />
            <span className="text-xs text-gray-400 hidden sm:inline">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
