'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useSettingsStore } from '@/store/settingsStore';

export function SettingsScreen() {
  const { developerMode, soundEnabled, setDeveloperMode, setSoundEnabled } = useSettingsStore();

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-black text-center">Settings</h1>

      <GlassCard className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-medium">Developer Mode</p>
            <p className="text-xs text-gray-500">Show live game state, socket events, debug panel</p>
          </div>
          <button
            onClick={() => setDeveloperMode(!developerMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              developerMode ? 'bg-stadium-green' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform m-0.5 ${
                developerMode ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-medium">Sound Effects</p>
            <p className="text-xs text-gray-500">Ball reveal, runs, wickets, victory sounds</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              soundEnabled ? 'bg-stadium-green' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform m-0.5 ${
                soundEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>
      </GlassCard>

      <GlassCard>
        <h3 className="font-bold text-stadium-green mb-2">About</h3>
        <p className="text-sm text-gray-400">
          Handy Cricket League v1.0 — Real-time multiplayer hand cricket. Profile data stored locally.
        </p>
      </GlassCard>
    </div>
  );
}
