'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GameScreen } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import Link from 'next/link';

const NAV_ITEMS: { label: string; screen: GameScreen }[] = [
  { label: 'Home', screen: 'home' },
  { label: 'Profile', screen: 'profile' },
  { label: 'Rules', screen: 'rules' },
  { label: 'Multiplayer Test', screen: 'test-match' },
  { label: 'Settings', screen: 'settings' },
];

export function Header() {
  const { screen, setScreen, isConnected } = useGameStore();
  const { developerMode } = useSettingsStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (s: GameScreen) => {
    setScreen(s);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-stadium-border/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-black text-lg hover:text-stadium-green transition-colors"
        >
          <span className="text-2xl">🏏</span>
          <span className="hidden sm:inline bg-gradient-to-r from-stadium-green to-stadium-green-glow bg-clip-text text-transparent">
            HCL
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                screen === item.screen
                  ? 'bg-stadium-green/20 text-stadium-green'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/test-page"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
          >
            Tests
          </Link>
        </nav>

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

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => navigate(item.screen)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    screen === item.screen ? 'bg-stadium-green/20 text-stadium-green' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/test-page"
                className="block px-3 py-2 rounded-lg text-sm text-gray-400"
                onClick={() => setMobileOpen(false)}
              >
                Tests
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
